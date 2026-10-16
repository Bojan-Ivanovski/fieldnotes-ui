import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { useTree } from '@headless-tree/react';
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '../../foundations/utilities/cn.js';
import { useControlled } from '../../foundations/utilities/use-controlled.js';
export interface ResourceItem {
  id: string;
  label: string;
  children?: readonly ResourceItem[];
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
}
const rootId = '__fn_internal_root__';
const emptyExpanded: string[] = [];
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
  className,
  ref,
  onKeyDown,
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
  const records = useMemo(() => {
    const map = new Map<string, ResourceItem>();
    const visit = (nodes: readonly ResourceItem[]) => {
      for (const node of nodes) {
        if (!node.id || node.id === rootId || map.has(node.id))
          throw new Error(
            `Resource IDs must be unique and nonempty: ${node.id}`,
          );
        map.set(node.id, node);
        if (node.children) visit(node.children);
      }
    };
    visit(items);
    map.set(rootId, { id: rootId, label, children: items });
    return map;
  }, [items, label]);
  const tree = useTree<ResourceItem>({
    rootItemId: rootId,
    state: { expandedItems: expanded },
    setExpandedItems: (next) =>
      setExpanded(typeof next === 'function' ? next(expanded) : next),
    getItemName: (node) => node.getItemData().label,
    isItemFolder: (node) =>
      !node.getItemData().disabled && node.getItemData().children !== undefined,
    dataLoader: {
      getItem: (id) => records.get(id)!,
      getChildren: (id) =>
        records.get(id)?.children?.map((node) => node.id) ?? [],
    },
    onPrimaryAction: (node) => {
      if (!node.getItemData().disabled) setSelected(node.getId());
    },
    hotkeys: {
      customActivate: {
        hotkey: 'Enter',
        preventDefault: true,
        handler: (_event, tree) => tree.getFocusedItem()?.primaryAction(),
      },
      customActivateSpace: {
        hotkey: 'Space',
        preventDefault: true,
        handler: (_event, tree) => tree.getFocusedItem()?.primaryAction(),
      },
      expandOrDown: {
        hotkey: 'ArrowRight',
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
      collapseOrUp: { hotkey: 'ArrowLeft', preventDefault: true },
      focusFirstItem: { hotkey: 'Home', preventDefault: true },
      focusLastItem: { hotkey: 'End', preventDefault: true },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });
  useEffect(() => {
    tree.rebuildTree();
    const visible = tree.getItems();
    if (visible.length && !visible.some((item) => item.isFocused()))
      (
        visible.find((item) => item.getId() === selected) ?? visible[0]
      ).setFocused();
  }, [records, tree, expanded, selected]);
  const register = useCallback(
    (node: HTMLDivElement | null) => {
      tree.registerElement(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [tree, ref],
  );
  const typed = useRef({ text: '', at: 0 });
  return (
    <div
      {...props}
      {...tree.getContainerProps(label)}
      ref={register}
      className={cn('fn-resource-explorer', className)}
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
        const prefix = [...text].every((value) => value === character)
          ? character
          : text;
        const visible = tree.getItems(),
          index = visible.findIndex((node) => node.isFocused());
        const ordered = [
          ...visible.slice(index + 1),
          ...visible.slice(0, index + 1),
        ];
        const match = ordered.find((node) =>
          node.getItemName().toLocaleLowerCase().startsWith(prefix),
        );
        if (match) {
          event.preventDefault();
          match.setFocused();
          tree.updateDomFocus();
        }
      }}
    >
      {tree.getItems().map((node) => {
        const item = node.getItemData(),
          folder = item.children !== undefined;
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
            onFocus={() => node.setFocused()}
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
    </div>
  );
}
