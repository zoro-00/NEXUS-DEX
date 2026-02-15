import { motion } from 'framer-motion';
import { SwapCard } from '@/components/custom/SwapCard';
import { PriceChart } from '@/components/custom/PriceChart';

export function SwapSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Swap Card */}
        <div className="order-2 lg:order-1">
          <SwapCard />
        </div>
        
        {/* Price Chart */}
        <div className="order-1 lg:order-2">
          <PriceChart />
        </div>
      </div>
    </motion.section>
  );
}
