"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ArrowRight, ChevronDown, ChevronRight, PackageSearch } from "lucide-react";

export type NavNode = {
  id: string;
  name: string;
  href: string;
  /** Optional right-hand meta, e.g. product count or year range. */
  meta?: string;
  image?: string | null;
  children?: NavNode[];
};

// Landing nav mega menu. One panel that never outgrows the viewport: the
// left rail lists every top-level item (scrolls on its own when long), the
// right pane shows the hovered/focused item's sub-levels in flowing columns.
// Flat lists (no children anywhere) render as a scrollable multi-column grid.
// Opens on hover for mouse users, and on click/tap/keyboard for everyone.

const CLOSE_DELAY = 160;

function Thumb({ node }: { node: NavNode }) {
  return (
    <span className="mrk-menu-thumb" aria-hidden="true">
      {node.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={node.image} alt="" />
      ) : (
        <PackageSearch />
      )}
    </span>
  );
}

function Pane({ node, close }: { node: NavNode; close: () => void }) {
  const kids = node.children ?? [];
  return (
    <div className="mrk-mega-pane">
      <div className="mrk-mega-pane-head">
        <div>
          <p className="mrk-mega-pane-title">{node.name}</p>
          {node.meta && <p className="mrk-mega-pane-meta">{node.meta}</p>}
        </div>
        <DropdownMenuPrimitive.Item asChild className="mrk-menu-all">
          <Link href={node.href} onClick={close}>
            View all <ArrowRight aria-hidden="true" />
          </Link>
        </DropdownMenuPrimitive.Item>
      </div>
      {kids.length ? (
        <div className="mrk-mega-cols">
          {kids.map((child) => (
            <div key={child.id} className="mrk-mega-group">
              <DropdownMenuPrimitive.Item asChild className="mrk-mega-group-title">
                <Link href={child.href} onClick={close}>
                  <span>{child.name}</span>
                  {child.meta && <small>{child.meta}</small>}
                </Link>
              </DropdownMenuPrimitive.Item>
              {child.children?.length ? (
                <ul>
                  {child.children.map((leaf) => (
                    <li key={leaf.id}>
                      <DropdownMenuPrimitive.Item asChild className="mrk-mega-leaf">
                        <Link href={leaf.href} onClick={close}>
                          {leaf.name}
                          {leaf.meta && <small>{leaf.meta}</small>}
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mrk-mega-empty">
          <Thumb node={node} />
          <p>No sub-categories here yet — see everything in {node.name}.</p>
          <DropdownMenuPrimitive.Item asChild className="mrk-mega-empty-cta">
            <Link href={node.href} onClick={close}>
              Browse {node.name} <ArrowRight aria-hidden="true" />
            </Link>
          </DropdownMenuPrimitive.Item>
        </div>
      )}
    </div>
  );
}

export function NavMenu({
  label,
  heading,
  items,
  allHref = "/products",
  thumbs = false,
  onNavigate,
}: {
  label: string;
  heading: string;
  items: NavNode[];
  allHref?: string;
  thumbs?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keepOpen = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const scheduleClose = useCallback(() => {
    keepOpen();
    timer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, [keepOpen]);
  useEffect(() => keepOpen, [keepOpen]);

  const close = () => {
    keepOpen();
    setOpen(false);
    onNavigate?.();
  };
  // Hover behaviour is for mouse pointers only; touch uses tap-to-open.
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    keepOpen();
    setOpen(true);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    scheduleClose();
  };

  if (!items.length) return null;
  const nested = items.some((i) => i.children?.length);
  const active = items.find((i) => i.id === activeId) ?? items[0];

  return (
    <DropdownMenuPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setActiveId(null);
      }}
      modal={false}
    >
      <DropdownMenuPrimitive.Trigger
        className="mrk-nav-trigger"
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        {label}
        <ChevronDown size={14} aria-hidden="true" />
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          sideOffset={10}
          collisionPadding={16}
          className={`mrk-menu-panel ${nested ? "mrk-mega" : "mrk-mega-flat"}`}
          // Size the mega panel to its rail (so a short list isn't a mostly
          // empty box) but keep it fixed while hovering so it never jumps.
          style={
            nested
              ? { height: `min(72svh, ${Math.max(340, Math.min(560, 100 + items.length * 46))}px)` }
              : undefined
          }
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="mrk-menu-head">
            <span>
              {heading} <em>{items.length}</em>
            </span>
            <DropdownMenuPrimitive.Item asChild className="mrk-menu-all">
              <Link href={allHref} onClick={close}>
                Browse all <ArrowRight aria-hidden="true" />
              </Link>
            </DropdownMenuPrimitive.Item>
          </div>

          {nested ? (
            <div className="mrk-mega-body">
              <div className="mrk-mega-rail">
                {items.map((node) => (
                  <DropdownMenuPrimitive.Item
                    key={node.id}
                    asChild
                    className={`mrk-menu-item ${node.id === active.id ? "is-active" : ""}`}
                    onPointerMove={() => setActiveId(node.id)}
                    onFocus={() => setActiveId(node.id)}
                  >
                    <Link href={node.href} onClick={close}>
                      {thumbs && <Thumb node={node} />}
                      <span className="mrk-menu-label">{node.name}</span>
                      {node.meta && <span className="mrk-menu-meta">{node.meta}</span>}
                      {node.children?.length ? (
                        <ChevronRight className="mrk-menu-chevron" aria-hidden="true" />
                      ) : (
                        <span className="mrk-menu-chevron" aria-hidden="true" />
                      )}
                    </Link>
                  </DropdownMenuPrimitive.Item>
                ))}
              </div>
              <Pane node={active} close={close} />
            </div>
          ) : (
            <div className="mrk-mega-grid">
              {items.map((node) => (
                <DropdownMenuPrimitive.Item key={node.id} asChild className="mrk-menu-item">
                  <Link href={node.href} onClick={close}>
                    {thumbs && <Thumb node={node} />}
                    <span className="mrk-menu-label">{node.name}</span>
                    {node.meta && <span className="mrk-menu-meta">{node.meta}</span>}
                  </Link>
                </DropdownMenuPrimitive.Item>
              ))}
            </div>
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
