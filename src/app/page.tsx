import SiteShell from "@/components/layout/SiteShell";
import Hero from "@/components/sections/Hero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Categories from "@/components/sections/Categories";
import WhyChoose from "@/components/sections/WhyChoose";
import Newsletter from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <WhyChoose />
      <Newsletter />
    </SiteShell>
  );
}
