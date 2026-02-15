import { motion } from 'framer-motion';
import { PoolTable } from '@/components/custom/PoolTable';

export function PoolsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white mb-2">Liquidity Pools</h1>
        <p className="text-[#85868b]">
          Provide liquidity to earn fees and rewards from trading activity
        </p>
      </div>
      
      <PoolTable />
    </motion.section>
  );
}
