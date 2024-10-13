"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardItemsProps } from './DashboardItems.types';
import { DASHBOARD_NAVIGATION } from "@/constants/navigation";
import clsx from "clsx";

export default function DashboardItems (props: DashboardItemsProps) {
  const pathname = usePathname();
  return (
    <>
      {DASHBOARD_NAVIGATION.map((item) => (
        <Link
          href={item.href}
          key={item.name}
          className={clsx(
            pathname == item.href
              ? "bg-default-100 text-primary"
              : "text-default-900 bg-none",
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:stroke-primary hover:bg-default-100 w-full"
          )}
        >
          <item.icon className="size-5 stroke-[1.5]" />
          {item.name}
        </Link>
      ))}
    </>
  );
}