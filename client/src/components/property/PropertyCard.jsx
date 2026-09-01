import { Link } from "react-router-dom";
import { MapPin, Star, Users, Bed, Bath } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../utils/formatPrice";

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();

  const typeLabel = property.type || "Appartement";
  const statusLabel = property.listingType === "sale" ? "A vendre" : "A louer";
  const statusColor = property.listingType === "sale"
    ? { bg: "#dcfce7", text: "#16a34a" }
    : { bg: "#dbeafe", text: "#2563eb" };

  return (
    <Link
      to={"/properties/" + property._id}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-lg)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "var(--shadow)"}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <img
          src={property.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Status + type badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
            {statusLabel}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--text-primary)" }}>
            {typeLabel}
          </span>
        </div>
        {/* Rating */}
        {property.averageRating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#f59e0b" }}>
            <Star className="w-3 h-3 fill-amber-400" />
            {property.averageRating.toFixed(1)}
          </div>
        )}
        {/* Status badge for pending/rejected */}
        {property.status === "pending" && (
          <span className="absolute bottom-3 left-3 badge-pending">{t("property.pending")}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-bold mb-1" style={{ color: "var(--accent)" }}>
          {formatPrice(property.pricePerNight)}
          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
            {t("property.perNight")}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug truncate mb-2" style={{ color: "var(--text-primary)" }}>
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <span className="truncate">{property.city}, Maroc</span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Amenities */}
        <div className="flex items-center gap-4 text-xs pt-3" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            {property.bedrooms} {t("property.bedrooms")}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            {property.bathrooms} {t("property.bathrooms")}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            {property.maxGuests}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
