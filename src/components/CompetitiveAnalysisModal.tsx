import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button, buttonVariants } from "./ui/button";
import { Check, ChevronsUpDown, Loader2, BarChart3, TrendingUp, ShieldAlert, Target, Award, Shield } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { gemini } from "../services/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

const BUSINESS_TYPES = [
  "SaaS / Software",
  "E-commerce / Retail",
  "Fintech / Banking",
  "Healthtech / Healthcare",
  "Edtech / Education",
  "Real Estate / Proptech",
  "Food & Beverage / Restaurant",
  "Travel & Hospitality",
  "Marketing & Advertising",
  "Manufacturing / Logistics",
  "Energy / Cleantech",
  "Entertainment / Media",
  "AI / Machine Learning",
  "Cybersecurity",
  "Blockchain / Web3"
];

interface CompetitiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompetitiveAnalysisModal({ isOpen, onClose }: CompetitiveAnalysisModalProps) {
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [progressStep, setProgressStep] = React.useState(0);

  const steps = [
    "Initializing Strategic Intelligence Protocol...",
    "Scanning Global Market Dynamics...",
    "Identifying Top Tier Competitors...",
    "Analyzing Asymmetric Advantages...",
    "Synthesizing Latest Industry Trends...",
    "Evaluating Risk Parameters...",
    "Finalizing Competitive Dashboard..."
  ];

  React.useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!value) return;
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await gemini.generateCompetitiveAnalysis(value);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-slate-50 dark:bg-slate-950 border-navy/10 dark:border-white/10">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black font-serif flex items-center gap-2">
            <Target className="text-gold" />
            Competitive Intelligence Dashboard
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Select a business sector to generate an elite-level strategic analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6 flex-1 overflow-hidden">
          <div className="flex items-center gap-4">
            <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between bg-white dark:bg-slate-900 border-navy/10 dark:border-white/10"
                )}
                aria-expanded={openDropdown}
              >
                {value
                  ? BUSINESS_TYPES.find((type) => type === value)
                  : "Select business type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search business type..." />
                  <CommandList>
                    <CommandEmpty>No business type found.</CommandEmpty>
                    <CommandGroup>
                      {BUSINESS_TYPES.map((type) => (
                        <CommandItem
                          key={type}
                          value={type}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue);
                            setOpenDropdown(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === type ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button 
              onClick={handleGenerate} 
              disabled={!value || isLoading}
              className="bg-gold text-navy hover:bg-gold/90 font-bold px-8"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Analysis"}
            </Button>
          </div>

          <ScrollArea className="flex-1 rounded-xl border border-navy/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 p-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-6 py-20"
                >
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-gold" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 bg-gold/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <motion.p 
                      key={progressStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-bold text-navy dark:text-white font-serif"
                    >
                      {steps[progressStep]}
                    </motion.p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-black">
                      Proof of Work Protocol Active
                    </p>
                  </div>
                  <div className="w-64 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ) : analysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Header Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-navy text-white border-none shadow-lg">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-gold">Market Sector</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xl font-bold font-serif">{analysis.businessType}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-800 border-navy/5 dark:border-white/5 shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Quality Score</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex items-center gap-3">
                        <span className="text-3xl font-black text-navy dark:text-white">{analysis.qualityScore}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.qualityScore}%` }}
                            className={cn(
                              "h-full",
                              analysis.qualityScore > 70 ? "bg-emerald-500" : analysis.qualityScore > 40 ? "bg-gold" : "bg-rose-500"
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-800 border-navy/5 dark:border-white/5 shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Strategic Status</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Badge className="bg-gold/10 text-gold border-gold/20 hover:bg-gold/20">
                          {analysis.qualityScore > 75 ? "High Opportunity" : "Competitive Market"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Market Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <section>
                        <h4 className="text-sm font-black uppercase tracking-widest text-navy dark:text-white mb-3 flex items-center gap-2">
                          <BarChart3 size={16} className="text-gold" />
                          Market Dynamics
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-navy/5 dark:border-white/5">
                          {analysis.marketOverview}
                        </p>
                      </section>

                      <section>
                        <h4 className="text-sm font-black uppercase tracking-widest text-navy dark:text-white mb-3 flex items-center gap-2">
                          <Target size={16} className="text-gold" />
                          Strategic Advantages
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {analysis.strategicAdvantages.map((adv: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-sm text-slate-600 dark:text-slate-400">
                              <Check size={16} className="text-emerald-500 mt-0.5" />
                              {adv}
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h4 className="text-sm font-black uppercase tracking-widest text-navy dark:text-white mb-3 flex items-center gap-2">
                          <TrendingUp size={16} className="text-gold" />
                          Latest Trends
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.latestTrends.map((trend: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 py-1 px-3">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h4 className="text-sm font-black uppercase tracking-widest text-navy dark:text-white mb-3 flex items-center gap-2">
                          <ShieldAlert size={16} className="text-gold" />
                          Risk Assessment
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-rose-500/5 p-4 rounded-lg border border-rose-500/10 italic">
                          "{analysis.riskAssessment}"
                        </p>
                      </section>
                    </div>
                  </div>

                  {/* Top Competitors */}
                  <section>
                    <h4 className="text-sm font-black uppercase tracking-widest text-navy dark:text-white mb-4 flex items-center gap-2">
                      <Award size={16} className="text-gold" />
                      Competitor Landscape
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysis.topCompetitors.map((comp: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border border-navy/5 dark:border-white/5 bg-white dark:bg-slate-800 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-navy dark:text-white">{comp.name}</span>
                            <span className="text-[10px] font-black text-slate-300">0{i + 1}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase font-black text-emerald-500">Strength</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{comp.strength}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase font-black text-rose-500">Weakness</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{comp.weakness}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <div className="h-20 w-20 rounded-full bg-gold/5 flex items-center justify-center text-gold/20">
                    <BarChart3 size={40} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-navy dark:text-white">Ready for Analysis</p>
                    <p className="text-sm text-slate-400">Select a business type above to begin the intelligence protocol.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        <div className="p-4 border-t border-navy/5 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Shield size={12} />
            <span>Encrypted Intelligence Stream</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs font-bold">
            Close Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
