import HeroSection from '../component/common/HeroSection';
import FeaturedEvents from '../component/home/FeaturedEvents';
import HowItWorks from '../component/home/HowItWorks';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedEvents />
      <HowItWorks />
    </div>
  );
};

export default Home;