import { createElement, type HTMLAttributes, type Ref } from 'react';
import { cn } from '../../foundations/utilities/cn.js';
export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  as?: 'span' | 'p';
  tone?: 'default' | 'muted';
}
export function Text({
  as = 'span',
  tone = 'default',
  className,
  ...props
}: TextProps) {
  return createElement(as, {
    ...props,
    className: cn('fn-text', className),
    'data-tone': tone,
  });
}
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: Ref<HTMLHeadingElement>;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}
export function Heading({ level = 2, className, ...props }: HeadingProps) {
  return createElement(`h${level}`, {
    ...props,
    className: cn('fn-heading', className),
  });
}
