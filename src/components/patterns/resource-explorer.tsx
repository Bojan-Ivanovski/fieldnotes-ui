import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { useTree } from '@headless-tree/react';
import {
  hotkeysCoreFeature,
  syncDataLoaderFeature,
  type FeatureImplementation,
} from '@headless-tree/core';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
import { LoadMoreButton } from '../composites/search-results.js';
import { Text } from '../primitives/typography.js';

export interface ResourceBranch {
  state: 'unloaded' | 'loading' | 'error' | 'ready';
  hasMore?: boolean;
  /** Optional localized progress/error/empty status. */
  message?: string;
  /** Optional localized request button text, including its loading text. */
  actionLabel?: string;
}
export type ResourceRequestReason = 'load' | 'retry' | 'more';
export interface ResourceItem {
  id: string;
  label: string;
  children?: readonly ResourceItem[];
  branch?: ResourceBranch;
  disabled?: boolean;
  icon?: ReactNode;
}
export interface ResourceExplorerProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onSelect' | 'children'
> {
  label: string;
  items: readonly ResourceItem[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  renderLabel?: (item: ResourceItem) => ReactNode;
  filter?: string;
  filterItem?: (item: ResourceItem, query: string) => boolean;
  emptyMessage?: ReactNode;
  onRequestChildren?: (id: string, reason: ResourceRequestReason) => void;
  branchControlsLabel?: string;
}
const rootId = '__fn_internal_root__';
const emptyExpanded: string[] = [];
const defaultMatch = (item: ResourceItem, query: string) =>
  item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase());
function branchMessage(item: ResourceItem) {
  const branch = item.branch!;
  if (branch.message !== undefined) return branch.message;
  if (branch.state === 'unloaded') return 'Children not loaded.';
  if (branch.state === 'loading') return 'Loading children…';
  if (branch.state === 'error') return 'Children could not be loaded.';
  const count = item.children?.length ?? 0;
  return count
    ? `${count} loaded children${branch.hasMore ? '; more available' : ''}.`
    : 'No children.';
}
export function ResourceExplorer({
  label,
  items,
  selectedId,
  defaultSelectedId = null,
  onSelect,
  expandedIds,
  defaultExpandedIds = emptyExpanded,
  onExpandedChange,
  renderLabel,
  filter = '',
  filterItem = defaultMatch,
  emptyMessage,
  onRequestChildren,
  branchControlsLabel = `${label} branch controls`,
  className,
  ref,
  onKeyDown,
  onFocusCapture,
  onBlurCapture,
  ...props
}: ResourceExplorerProps) {
  const [selected, setSelected] = useControlled(
    selectedId,
    defaultSelectedId,
    (value) => {
      if (value !== null) onSelect?.(value);
    },
  );
  const [expanded, setExpanded] = useControlled(
    expandedIds,
    defaultExpandedIds,
    onExpandedChange,
  );
  const query = filter.trim();
  const prefix = useId();
  const statusId = (id: string) => `${prefix}-branch-${encodeURIComponent(id)}`;
  const data = useMemo(() => {
    const records = new Map<string, ResourceItem>(),
      parents = new Map<string, string>();
    const visit = (nodes: readonly ResourceItem[], parent = rootId) => {
      for (const node of nodes) {
        if (!node.id || node.id === rootId || records.has(node.id))
          throw new Error(
            `Resource IDs must be unique and nonempty: ${node.id}`,
          );
        records.set(node.id, node);
        parents.set(node.id, parent);
        if (node.children) visit(node.children, node.id);
      }
    };
    visit(items);
    records.set(rootId, { id: rootId, label, children: items });
    return { records, parents };
  }, [items, label]);
  const view = useMemo(() => {
    const children = new Map<string, string[]>(),
      opened: string[] = [];
    const visit = (nodes: readonly ResourceItem[]): string[] => {
      const ids: string[] = [];
      for (const item of nodes) {
        const nested = query && item.disabled ? [] : visit(item.children ?? []);
        if (!query || filterItem(item, query) || nested.length) {
          ids.push(item.id);
          children.set(item.id, nested);
          if (query && nested.length && !item.disabled) opened.push(item.id);
        }
      }
      return ids;
    };
    children.set(rootId, visit(items));
    return { children, opened };
  }, [items, query, filterItem]);
  const [filteredExpansion, setFilteredExpansion] = useState<{
    query: string;
    ids: string[];
  } | null>(null);
  useEffect(() => setFilteredExpansion(null), [query]);
  const effectiveExpanded = useMemo(
    () =>
      !query
        ? expanded
        : filteredExpansion?.query === query
          ? filteredExpansion.ids
          : [...new Set([...expanded, ...view.opened])],
    [query, expanded, filteredExpansion, view],
  );
  const [requests, setRequests] = useState(
    new Map<string, ResourceBranch['state']>(),
  );
  const requestRef = useRef(requests);
  const requestChildren = useCallback(
    (id: string, reason: ResourceRequestReason) => {
      const item = data.records.get(id),
        branch = item?.branch;
      if (
        !item ||
        item.disabled ||
        !branch ||
        !onRequestChildren ||
        requestRef.current.has(id) ||
        branch.state === 'loading'
      )
        return;
      if (reason === 'load' && branch.state !== 'unloaded') return;
      if (reason === 'retry' && branch.state !== 'error') return;
      if (reason === 'more' && (branch.state !== 'ready' || !branch.hasMore))
        return;
      const next = new Map(requestRef.current);
      next.set(id, branch.state);
      requestRef.current = next;
      setRequests(next);
      onRequestChildren(id, reason);
    },
    [data, onRequestChildren],
  );
  const rootElement = useRef<HTMLDivElement | null>(null),
    focusWithin = useRef(false),
    focusedId = useRef<string | null>(null),
    pendingFocus = useRef<string | null>(null);
  const oldParents = useRef(data.parents);
  // Replace the primitive's delayed focus poll with a cancellable DOM handoff.
  const focusFeature = useMemo<FeatureImplementation<ResourceItem>>(
    () => ({
      key: 'fieldnotes-focus',
      treeInstance: {
        updateDomFocus: ({ tree }) => {
          if (!focusWithin.current) return;
          const item = tree.getFocusedItem();
          if (!item) return;
          const element = item.getElement();
          pendingFocus.current = element ? null : item.getId();
          element?.focus();
        },
      },
    }),
    [],
  );
  const tree = useTree<ResourceItem>({
    rootItemId: rootId,
    state: { expandedItems: effectiveExpanded },
    setExpandedItems: (next) => {
      const ids = typeof next === 'function' ? next(effectiveExpanded) : next;
      if (query) {
        setFilteredExpansion({ query, ids });
        for (const id of ids)
          if (!effectiveExpanded.includes(id)) requestChildren(id, 'load');
      } else setExpanded(ids);
    },
    getItemName: (node) => node.getItemData().label,
    isItemFolder: (node) => {
      const item = node.getItemData();
      return (
        !item.disabled &&
        (item.children !== undefined || item.branch !== undefined)
      );
    },
    dataLoader: {
      getItem: (id) => data.records.get(id)!,
      getChildren: (id) => view.children.get(id) ?? [],
    },
    onPrimaryAction: (node) => {
      if (!node.getItemData().disabled) setSelected(node.getId());
    },
    hotkeys: {
      focusNextItem: {
        hotkey: 'ArrowDown',
        isEnabled: (tree) => tree.getItems().length > 0,
      },
      focusPreviousItem: {
        hotkey: 'ArrowUp',
        isEnabled: (tree) => tree.getItems().length > 0,
      },
      customActivate: {
        hotkey: 'Enter',
        isEnabled: (tree) => tree.getItems().length > 0,
        preventDefault: true,
        handler: (_event, tree) => tree.getFocusedItem()?.primaryAction(),
      },
      customActivateSpace: {
        hotkey: 'Space',
        isEnabled: (tree) => tree.getItems().length > 0,
        preventDefault: true,
        handler: (_event, tree) => tree.getFocusedItem()?.primaryAction(),
      },
      expandOrDown: {
        hotkey: 'ArrowRight',
        isEnabled: (tree) => tree.getItems().length > 0,
        preventDefault: true,
        handler: (_event, tree) => {
          const item = tree.getFocusedItem();
          if (!item?.isFolder()) return;
          if (item.isExpanded()) {
            const child = item.getChildren()[0];
            if (child) {
              child.setFocused();
              tree.updateDomFocus();
            }
          } else item.expand();
        },
      },
      collapseOrUp: {
        hotkey: 'ArrowLeft',
        preventDefault: true,
        isEnabled: (tree) => tree.getItems().length > 0,
      },
      focusFirstItem: {
        hotkey: 'Home',
        preventDefault: true,
        isEnabled: (tree) => tree.getItems().length > 0,
      },
      focusLastItem: {
        hotkey: 'End',
        preventDefault: true,
        isEnabled: (tree) => tree.getItems().length > 0,
      },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature, focusFeature],
  });
  // A stale tree cache may contain removed IDs until the rebuild effect runs.
  const visible = tree
    .getItems()
    .filter(
      (node) =>
        data.records.has(node.getId()) && view.children.has(node.getId()),
    );
  const hasRows = visible.length > 0;
  useEffect(() => {
    tree.rebuildTree();
    const rows = tree.getItems(),
      ids = new Set(rows.map((node) => node.getId()));
    let next =
      focusedId.current && ids.has(focusedId.current)
        ? focusedId.current
        : null;
    let ancestor = focusedId.current;
    while (!next && ancestor && ancestor !== rootId) {
      ancestor = oldParents.current.get(ancestor) ?? null;
      if (ancestor && ids.has(ancestor)) next = ancestor;
    }
    next ??=
      selected && ids.has(selected) ? selected : (rows[0]?.getId() ?? null);
    focusedId.current = next;
    oldParents.current = data.parents;
    if (next) {
      const item = tree.getItemInstance(next);
      item.setFocused();
      if (focusWithin.current) {
        const element = item.getElement();
        pendingFocus.current = element ? null : next;
        if (element && element !== document.activeElement) element.focus();
      }
    } else {
      pendingFocus.current = null;
      if (tree.getState().focusedItem !== null)
        tree.setState((state) => ({ ...state, focusedItem: null }));
      if (focusWithin.current) rootElement.current?.focus();
    }
  }, [data, view, effectiveExpanded, selected, tree]);
  useLayoutEffect(() => {
    if (!focusWithin.current) {
      pendingFocus.current = null;
      return;
    }
    if (pendingFocus.current) {
      const element = tree.getItemInstance(pendingFocus.current).getElement();
      if (element) {
        pendingFocus.current = null;
        element.focus();
      }
    }
  });
  useEffect(() => {
    const next = new Map(requestRef.current);
    for (const [id, state] of next)
      if (data.records.get(id)?.branch?.state !== state) next.delete(id);
    if (next.size !== requestRef.current.size) {
      requestRef.current = next;
      setRequests(next);
    }
    // A filtered ancestor must not make a previously hidden stored expansion fetch.
    const visibleIds = new Set(tree.getItems().map((node) => node.getId()));
    const expandedSet = new Set(expanded);
    for (const id of expanded) {
      let parent = data.parents.get(id);
      let reachable = visibleIds.has(id);
      while (parent && parent !== rootId) {
        if (!expandedSet.has(parent) || data.records.get(parent)?.disabled)
          reachable = false;
        parent = data.parents.get(parent);
      }
      if (reachable) requestChildren(id, 'load');
    }
  }, [data, view, expanded, requestChildren, tree]);
  const register = useCallback(
    (node: HTMLDivElement | null) => {
      rootElement.current = node;
      // Keep keyup registration stable when the collection becomes empty.
      tree.registerElement(node);
      if (typeof ref === 'function') {
        const cleanup = ref(node);
        if (typeof cleanup === 'function')
          return () => {
            rootElement.current = null;
            tree.registerElement(null);
            cleanup();
          };
      } else if (ref) ref.current = node;
    },
    [tree, ref],
  );
  const typed = useRef({ text: '', at: 0 });
  useEffect(() => {
    typed.current = { text: '', at: 0 };
  }, [query]);
  const branches = visible.filter(
    (node) =>
      node.getItemData().branch &&
      !node.getItemData().disabled &&
      node.isExpanded(),
  );
  return (
    <div className="fn-stack" data-direction="vertical">
      <div
        {...props}
        {...tree.getContainerProps(label)}
        role={hasRows ? 'tree' : 'region'}
        tabIndex={hasRows ? props.tabIndex : 0}
        ref={register}
        className={cn('fn-control fn-resource-explorer', className)}
        onFocusCapture={(event) => {
          onFocusCapture?.(event);
          focusWithin.current = true;
        }}
        onBlurCapture={(event) => {
          onBlurCapture?.(event);
          if (
            !(event.relatedTarget instanceof Node) ||
            !event.currentTarget.contains(event.relatedTarget)
          )
            focusWithin.current = false;
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            event.key.length !== 1 ||
            event.key === ' '
          )
            return;
          const now = Date.now(),
            character = event.key.toLocaleLowerCase();
          const text =
            now - typed.current.at < 700
              ? typed.current.text + character
              : character;
          typed.current = { text, at: now };
          const value = [...text].every((letter) => letter === character)
            ? character
            : text;
          const index = visible.findIndex((node) => node.isFocused());
          const match = [
            ...visible.slice(index + 1),
            ...visible.slice(0, index + 1),
          ].find((node) =>
            node.getItemName().toLocaleLowerCase().startsWith(value),
          );
          if (match) {
            event.preventDefault();
            match.setFocused();
            tree.updateDomFocus();
          }
        }}
      >
        {visible.map((node) => {
          const item = node.getItemData(),
            folder = item.children !== undefined || item.branch !== undefined;
          const described = item.branch && !item.disabled && node.isExpanded();
          return (
            <div
              {...node.getProps()}
              key={item.id}
              className="fn-control fn-tree-item"
              aria-selected={selected === item.id}
              aria-disabled={item.disabled || undefined}
              aria-expanded={
                folder ? node.isExpanded() && !item.disabled : undefined
              }
              aria-busy={
                item.branch?.state === 'loading' ||
                requests.has(item.id) ||
                undefined
              }
              aria-describedby={described ? statusId(item.id) : undefined}
              onFocus={() => {
                pendingFocus.current = null;
                focusedId.current = item.id;
                node.setFocused();
              }}
              onClick={(event) => {
                node.setFocused();
                if (!item.disabled) node.getProps().onClick(event);
              }}
              style={{ paddingInlineStart: 9 + node.getItemMeta().level * 13 }}
            >
              <span className="fn-tree-chevron" aria-hidden="true">
                {folder ? (
                  node.isExpanded() && !item.disabled ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )
                ) : null}
              </span>
              <span className="fn-tree-icon" aria-hidden="true">
                {item.icon ??
                  (folder ? <Folder size={14} /> : <FileText size={14} />)}
              </span>
              <span className="fn-tree-label">
                {renderLabel ? renderLabel(item) : item.label}
              </span>
            </div>
          );
        })}
        {!hasRows && (
          <Text as="p" role="status">
            {emptyMessage ??
              (query ? 'No matching loaded resources.' : 'No resources.')}
          </Text>
        )}
      </div>
      {branches.length > 0 && (
        <div
          role="region"
          aria-label={branchControlsLabel}
          className="fn-stack fn-branch-controls"
          data-direction="vertical"
        >
          {branches.map((node) => {
            const item = node.getItemData(),
              branch = item.branch!;
            const pending = branch.state === 'loading' || requests.has(item.id);
            const reason: ResourceRequestReason =
              branch.state === 'unloaded'
                ? 'load'
                : branch.state === 'error'
                  ? 'retry'
                  : 'more';
            const done = branch.state === 'ready' && !branch.hasMore;
            const action =
              branch.actionLabel ??
              `${branch.state === 'error' ? 'Retry' : branch.state === 'unloaded' ? 'Load' : done ? 'All loaded:' : 'Load more'} ${item.label}`;
            return (
              <div
                key={item.id}
                role="group"
                aria-label={item.label}
                className="fn-stack"
                data-direction="vertical"
                data-gap="sm"
              >
                <Text
                  as="p"
                  id={statusId(item.id)}
                  role="status"
                  aria-atomic="true"
                >
                  {branchMessage(item)}
                </Text>
                {onRequestChildren && (
                  <LoadMoreButton
                    pending={pending}
                    pendingLabel={branch.actionLabel ?? `Loading ${item.label}`}
                    aria-disabled={done}
                    onClick={() => requestChildren(item.id, reason)}
                  >
                    {action}
                  </LoadMoreButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
