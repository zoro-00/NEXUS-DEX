import { useState } from 'react';
import { X, Info, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSwapStore } from '@/stores';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];
const DEADLINE_PRESETS = [10, 20, 30];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSwapStore();
  const [slippage, setSlippage] = useState(settings.slippageTolerance.toString());
  const [deadline, setDeadline] = useState(settings.deadline.toString());

  const handleSlippageChange = (value: string) => {
    setSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      updateSettings({ slippageTolerance: numValue });
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadline(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      updateSettings({ deadline: numValue });
    }
  };

  const slippageWarning = settings.slippageTolerance > 5;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0d111c] border-[#22242c] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
            Transaction Settings
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#22242c] transition-colors"
            >
              <X className="w-5 h-5 text-[#85868b]" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Slippage Tolerance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[#85868b]">Slippage Tolerance</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-[#596070]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Your transaction will revert if the price changes unfavorably by more than this percentage.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2 mb-2">
              {SLIPPAGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSlippageChange(preset.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.slippageTolerance === preset
                      ? 'bg-[#3c3cc4] text-white'
                      : 'bg-[#1d1e24] text-[#85868b] hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
              <div className="flex-1 relative">
                <Input
                  type="number"
                  value={slippage}
                  onChange={(e) => handleSlippageChange(e.target.value)}
                  className="pr-8 bg-[#1d1e24] border-[#22242c] text-white text-right"
                  step={0.1}
                  min={0}
                  max={50}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85868b]">%</span>
              </div>
            </div>

            {slippageWarning && (
              <div className="flex items-center gap-2 text-sm text-[#ef4444]">
                <AlertTriangle className="w-4 h-4" />
                <span>High slippage tolerance may result in unfavorable rates</span>
              </div>
            )}
          </div>

          {/* Transaction Deadline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[#85868b]">Transaction Deadline</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-[#596070]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Your transaction will revert if it is pending for more than this period of time.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2">
              {DEADLINE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleDeadlineChange(preset.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.deadline === preset
                      ? 'bg-[#3c3cc4] text-white'
                      : 'bg-[#1d1e24] text-[#85868b] hover:text-white'
                  }`}
                >
                  {preset}m
                </button>
              ))}
              <div className="flex-1 relative">
                <Input
                  type="number"
                  value={deadline}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="pr-10 bg-[#1d1e24] border-[#22242c] text-white text-right"
                  min={1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#85868b]">min</span>
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Infinite Approval</p>
                <p className="text-xs text-[#85868b]">
                  Allow the contract to spend unlimited tokens
                </p>
              </div>
              <Switch
                checked={settings.infiniteApprove}
                onCheckedChange={(checked) => updateSettings({ infiniteApprove: checked })}
                className="data-[state=checked]:bg-[#3c3cc4]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Expert Mode</p>
                <p className="text-xs text-[#85868b]">
                  Allow high price impact trades and skip confirmations
                </p>
              </div>
              <Switch
                checked={settings.expertMode}
                onCheckedChange={(checked) => updateSettings({ expertMode: checked })}
                className="data-[state=checked]:bg-[#3c3cc4]"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
