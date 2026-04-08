import { useState } from "react";
import { CalendarDays, ShoppingBag, TrendingUp, Calendar } from "lucide-react";
import {
  useGetTodaySummary,
  useGetMonthSummary,
  useGetMonthlyTotals,
  useListSales,
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatBDT(amount: number) {
  return `BDT ${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SummaryCard({
  title,
  amount,
  count,
  icon: Icon,
  iconBg,
  isLoading,
}: {
  title: string;
  amount: number;
  count: number;
  icon: React.ElementType;
  iconBg: string;
  isLoading?: boolean;
}) {
  return (
    <div
      className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded-lg mb-1" />
          ) : (
            <p className="text-2xl font-extrabold text-foreground tracking-tight" data-testid={`text-amount-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              {formatBDT(amount)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-count-${title.toLowerCase().replace(/\s+/g, "-")}`}>
            {isLoading ? "..." : `${count} ${count === 1 ? "sale" : "sales"}`}
          </p>
        </div>
      </div>
    </div>
  );
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Dashboard() {
  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const { data: todaySummary, isLoading: todayLoading } = useGetTodaySummary();
  const { data: monthSummary, isLoading: monthLoading } = useGetMonthSummary();
  const { data: monthlyTotals, isLoading: chartLoading } = useGetMonthlyTotals(
    { year: selectedYear },
    { query: { queryKey: ["monthly-totals", selectedYear] } }
  );
  const { data: reportSales } = useListSales(
    { year: selectedYear, month: selectedMonth },
    { query: { queryKey: ["sales", selectedYear, selectedMonth] } }
  );

  const reportTotal = (reportSales ?? []).reduce((s, sale) => s + sale.total, 0);
  const reportMonthLabel = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const selectedMonthName = MONTHS[selectedMonth - 1];

  const chartData = chartLoading
    ? []
    : (monthlyTotals ?? []).map(m => ({ month: m.month, total: m.total }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          title="Today Sales"
          amount={todaySummary?.total ?? 0}
          count={todaySummary?.count ?? 0}
          icon={ShoppingBag}
          iconBg="bg-[hsl(174,72%,40%)]"
          isLoading={todayLoading}
        />
        <SummaryCard
          title="This Month Sales"
          amount={monthSummary?.total ?? 0}
          count={monthSummary?.count ?? 0}
          icon={TrendingUp}
          iconBg="bg-[hsl(221,83%,53%)]"
          isLoading={monthLoading}
        />
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-base font-semibold text-foreground">Monthly Sales Report</h2>

          <div className="relative">
            <button
              onClick={() => setMonthPickerOpen(o => !o)}
              data-testid="button-month-picker"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(174,72%,40%)] hover:bg-[hsl(174,72%,35%)] text-white text-sm font-medium transition-colors duration-150 shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              {selectedMonthName} {selectedYear}
            </button>

            {monthPickerOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-card-border rounded-2xl shadow-lg p-3 w-56">
                <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wide">Select Month</p>
                <div className="grid grid-cols-3 gap-1">
                  {MONTHS.map((m, i) => {
                    const monthNum = i + 1;
                    const isSelected = monthNum === selectedMonth;
                    return (
                      <button
                        key={m}
                        onClick={() => { setSelectedMonth(monthNum); setMonthPickerOpen(false); }}
                        data-testid={`button-month-${monthNum}`}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-[hsl(174,72%,40%)] text-white"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div
            className="bg-background border border-border rounded-xl p-5 hover:shadow-sm transition-shadow duration-150"
            data-testid="card-report-total"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(174,72%,94%)] dark:bg-[hsl(174,72%,20%)] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-[hsl(174,72%,40%)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Report Total</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight" data-testid="text-report-total">
                  {formatBDT(reportTotal)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-report-count">
                  {(reportSales ?? []).length} sales
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-background border border-border rounded-xl p-5 hover:shadow-sm transition-shadow duration-150"
            data-testid="card-report-month"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(221,83%,94%)] dark:bg-[hsl(221,83%,20%)] flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-[hsl(221,83%,53%)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Report Month</p>
                <p className="text-xl font-extrabold text-foreground tracking-tight" data-testid="text-report-month">
                  {reportMonthLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Selected month</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-4">Monthly Sales Overview — {selectedYear}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [formatBDT(value), "Sales"]}
                cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
              />
              <Bar dataKey="total" fill="hsl(174,72%,40%)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
