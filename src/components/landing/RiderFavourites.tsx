"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Bike, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { fmtMoney } from "@/lib/format";

export type FavouriteProduct = {
  id: string;
  slug: string;
  name: string;
  /** Viewer price — already trade-discounted server-side when applicable. */
  price: number;
  stock: number;
  image: string;
  brand: string | null;
  fitment: string;
  /** List price, set only when a trade discount lowered `price`. */
  wasPrice?: number;
};

/** Product card shared by every landing product section. `badge` renders a
 *  small chip over the photo (stock status, "New", …). */
export function ProductTile({ product, badge }: { product: FavouriteProduct; badge?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const add = useCart((s) => s.add);
  const saved = useWishlist((s) => s.items.some((i) => i.productId === product.id));
  const save = useWishlist((s) => s.add);
  const unsave = useWishlist((s) => s.remove);
  const soldOut = product.stock <= 0;
  const stockState = soldOut ? "out" : product.stock <= 5 ? "low" : "in";
  const stockLabel = soldOut
    ? "Sold out"
    : product.stock <= 5
      ? `Only ${product.stock} left`
      : "In stock";

  function toggle() {
    if (!session?.user?.id) {
      toast.message("Sign in to use the wishlist");
      router.push("/login?callbackUrl=/");
      return;
    }
    if (saved) void unsave(product.id);
    else
      void save({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        brand: product.brand,
      });
  }

  return (
    <article className="mrk-product">
      {badge && <span className="mrk-product-badge">{badge}</span>}
      <button
        className="mrk-save-button mrk-icon-button"
        aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
        aria-pressed={saved}
        onClick={toggle}
      >
        <Heart fill={saved ? "currentColor" : "none"} />
      </button>
      <Link href={`/products/${product.slug}`} className="mrk-product-image">
        <img src={product.image} alt={product.name} loading="lazy" width="1024" height="1024" />
      </Link>
      <div className="mrk-product-details">
        <Link className="mrk-product-name" href={`/products/${product.slug}`}>
          {product.name}
        </Link>
        {product.fitment && (
          <p className="mrk-product-fitment" title={`Fits ${product.fitment}`}>
            <Bike aria-hidden="true" />
            <span>Fits {product.fitment}</span>
          </p>
        )}
        <p className={`mrk-product-stock is-${stockState}`}>{stockLabel}</p>
        <div className="mrk-product-buy">
          <span className="mrk-product-price">
            {product.wasPrice !== undefined && (
              <s aria-label={`Was ${fmtMoney(product.wasPrice)}`}>{fmtMoney(product.wasPrice)}</s>
            )}
            <strong>{fmtMoney(product.price)}</strong>
          </span>
          <button
            className="mrk-button"
            disabled={soldOut}
            onClick={() => {
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
              });
              toast.success("Added to your basket", { description: product.name });
            }}
          >
            <ShoppingCart size={17} />
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function RiderFavourites({ products }: { products: FavouriteProduct[] }) {
  return (
    <section className="mrk-container mrk-favourites" aria-labelledby="favourites-title">
      <p className="mrk-eyebrow">
        Rider favourites <span />
      </p>
      <div className="mrk-section-heading">
        <h2 id="favourites-title">Rider favourites.</h2>
        <Link href="/products" className="mrk-text-link">
          View all products <ArrowRight />
        </Link>
      </div>
      <div className="mrk-product-grid">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </div>
      {!products.length && (
        <p className="mrk-catalogue-message">
          New favourites are on their way.{" "}
          <Link href="/products">
            Explore the full catalogue <ArrowRight size={16} />
          </Link>
        </p>
      )}
    </section>
  );
}
