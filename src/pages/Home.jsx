import Seo from '../components/Seo';
import Hero from '../components/home/Hero';
import Featured from '../components/home/Featured';
import HowManyPhotos from '../components/home/HowManyPhotos';
import ServicesPreview from '../components/home/ServicesPreview';
import Process from '../components/home/Process';
import Testimonials from '../components/home/Testimonials';
import CtaBand from '../components/home/CtaBand';

/* Section order is deliberate: the work comes before the pitch. A visitor who
   is not convinced by the photographs is not going to be convinced by a
   pricing table, so galleries sit directly under the hero. The "how many
   photos" answer lands next because it is the objection that stops people
   booking. */
export default function Home() {
  return (
    <>
      <Seo />
      <Hero />
      <Featured />
      <HowManyPhotos />
      <ServicesPreview />
      <Process />
      <Testimonials />
      <CtaBand />
    </>
  );
}
