import React from "react";
import { Slash } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface BreadcrumbHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
}

export function BreadcrumbHeader({ title, breadcrumbs = [] }: BreadcrumbHeaderProps) {
  return (
    <div className="bg-[#008000] text-white">
      {/* Main Title Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="lg:text-4xl text-2xl font-bold text-center">{title}</h1>
      </div>

      {/* Breadcrumb Section */}
      <div className="bg-[#036E03] bg-opacity-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <a
                    href={crumb.href || "#"}
                    className="text-white hover:text-green-100 transition-colors font-semibold text-[24px]"
                  >
                    {crumb.label}
                  </a>
                  {index < breadcrumbs.length - 1 && (
                    <Slash
                      size={16}
                      className="text-white opacity-60"
                    />
                  )}
                </React.Fragment>
              ))
            ) : (
              <span className="text-white text-sm opacity-80">
                Geen breadcrumbs
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
