"use client";

import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import PageLayout from "@/components/page-layout/PageLayout";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <div>
        <Navbar />
        <div>{children}</div>
        <Footer />
      </div>
    </PageLayout>
  );
}



// "use client";

// import Footer from "@/components/Footer/Footer";
// import Navbar from "@/components/navbar/Navbar";
// import PageLayout from "@/components/page-layout/PageLayout";
// import React, { useEffect, useState } from "react";
// import { usePathname } from "next/navigation";
// import Loading from "./loading";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const [loading, setLoading] = useState(true);

//   // Trigger loading on route change
//   useEffect(() => {
//     setLoading(true);

//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 1500);

//     return () => clearTimeout(timer);
//   }, [pathname]);

//   // ⛔ If loading, show ONLY the loading component
//   if (loading) {
//     return (
//       <PageLayout>
//         <Loading />
//       </PageLayout>
//     );
//   }

//   // ✔ When not loading, show the real layout
//   return (
//     <PageLayout>
//       <Navbar />
//       <div>{children}</div>
//       <Footer />
//     </PageLayout>
//   );
// }
