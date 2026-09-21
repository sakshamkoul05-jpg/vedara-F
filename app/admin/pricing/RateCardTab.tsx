'use client';

import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Section, SavingInput, SavingToggle, EmptyState } from './components';
import { createRecord, deleteRecord, updateRecord } from './api';
import { MONTH_NAMES, type AdminPricingConfig } from './types';

/**
 * Seasons, and the room-only rate matrix for every cottage and occupancy tier
 * (spec §5). This is the tariff itself — the numbers guests are quoted.
 */
export function RateCardTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const cottages = useMemo(
    () => config.cottages.filter((c) => c.pricingCategory),
    [config.cottages]
  );

  const rateFor = (seasonId: string, cottageId: string, adults: number) =>
    config.seasonRates.find(
      (r) => r.seasonId === seasonId && r.cottageId === cottageId && r.adults === adults
    );

  const saveRate = async (
    seasonId: string,
    cottageId: string,
    adults: number,
    field: 'weekdayRate' | 'weekendRate',
    raw: string
  ) => {
    const value = Math.round(Number(raw));
    if (!Number.isFinite(value) || value < 0) throw new Error('Enter a whole number of rupees');

    const existing = rateFor(seasonId, cottageId, adults);
    if (existing) {
      await updateRecord('season-rates', { id: existing.id, [field]: value });
    } else {
      // A tier with no row yet: create it, mirroring the other rate so the
      // missing weekday/weekend half is never left at zero.
      await createRecord('season-rates', {
        seasonId,
        cottageId,
        adults,
        weekdayRate: field === 'weekdayRate' ? value : value,
        weekendRate: field === 'weekendRate' ? value : value,
      });
    }
    await reload();
  };

  return (
    <>
      <Section
        title="Seasons"
        specRef="Spec §5"
        description="Which calendar months fall into each seasonal band. Special Peak dates, configured separately, override these."
      >
        {config.seasons.length === 0 ? (
          <EmptyState>
            No seasons configured. Run the pricing seed migration to load the v2.1 rate card.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {config.seasons.map((season) => (
              <div
                key={season.id}
                className="flex flex-wrap items-center gap-3 border border-border rounded-xl p-3"
              >
                <div className="w-28 shrink-0">
                  <SavingInput
                    value={season.name}
                    ariaLabel={`${season.type} season name`}
                    onSave={async (v) => {
                      await updateRecord('seasons', { id: season.id, name: v });
                      await reload();
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-1 flex-1 min-w-[240px]">
                  {MONTH_NAMES.map((m, i) => {
                    const month = i + 1;
                    const on = season.months.includes(month);
                    return (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={on}
                        onClick={async () => {
                          const months = on
                            ? season.months.filter((x) => x !== month)
                            : [...season.months, month].sort((a, b) => a - b);
                          await updateRecord('seasons', { id: season.id, months });
                          await reload();
                        }}
                        className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                          on
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <SavingToggle
                    checked={season.isActive}
                    label={`${season.name} active`}
                    onSave={async (next) => {
                      await updateRecord('seasons', { id: season.id, isActive: next });
                      await reload();
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          A month assigned to no active season will make every quote for that month fail, so keep
          all twelve covered.
        </p>
      </Section>

      {config.seasons.map((season) => (
        <Section
          key={season.id}
          title={`${season.name} rates`}
          specRef="Spec §5"
          description={`Room-only rate per cottage per night. Months: ${
            season.months.map((m) => MONTH_NAMES[m - 1]).join(', ') || 'none assigned'
          }.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Cottage</th>
                  <th className="py-2 pr-3 font-medium">Adults</th>
                  <th className="py-2 pr-3 font-medium">Mon–Thu</th>
                  <th className="py-2 pr-3 font-medium">Fri–Sun</th>
                </tr>
              </thead>
              <tbody>
                {cottages.map((cottage) => {
                  const tiers = Array.from(
                    { length: cottage.maxAdults - cottage.baseAdults + 1 },
                    (_, i) => cottage.baseAdults + i
                  );
                  return tiers.map((adults, idx) => {
                    const rate = rateFor(season.id, cottage.id, adults);
                    return (
                      <tr key={`${cottage.id}-${adults}`} className="border-b border-border/50">
                        <td className="py-2 pr-3">
                          {idx === 0 && (
                            <>
                              <span className="text-foreground">{cottage.name}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                {cottage.pricingCategory}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{adults}</td>
                        <td className="py-2 pr-3 w-32">
                          <SavingInput
                            type="number"
                            min={0}
                            prefix="₹"
                            value={rate?.weekdayRate ?? ''}
                            ariaLabel={`${cottage.name} ${season.name} ${adults} adults weekday rate`}
                            onSave={(v) =>
                              saveRate(season.id, cottage.id, adults, 'weekdayRate', v)
                            }
                          />
                        </td>
                        <td className="py-2 pr-3 w-32">
                          <SavingInput
                            type="number"
                            min={0}
                            prefix="₹"
                            value={rate?.weekendRate ?? ''}
                            ariaLabel={`${cottage.name} ${season.name} ${adults} adults weekend rate`}
                            onSave={(v) =>
                              saveRate(season.id, cottage.id, adults, 'weekendRate', v)
                            }
                          />
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
          {cottages.length === 0 && (
            <EmptyState>
              No cottage has a pricing category yet. Set one on the Cottages tab first.
            </EmptyState>
          )}
        </Section>
      ))}
    </>
  );
}

/** Special Peak periods and their flat rates (spec §6). */
export function SpecialPeakTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const cottages = config.cottages.filter((c) => c.pricingCategory);

  const addPeriod = async () => {
    const year = new Date().getFullYear();
    await createRecord('special-peak-periods', {
      name: 'New special peak period',
      startDate: `${year}-12-24`,
      endDate: `${year + 1}-01-02`,
      isActive: false,
    });
    await reload();
  };

  return (
    <Section
      title="Special Peak dates"
      specRef="Spec §6"
      description="Admin-defined dates that override the normal seasonal and weekday/weekend tariff — Christmas, New Year, festivals and long weekends. A Special Peak rate is flat: there is no weekday/weekend split."
      actions={
        <button onClick={addPeriod} className="cta-primary cta-sm">
          <Plus className="w-4 h-4" /> Add period
        </button>
      }
    >
      {config.specialPeakPeriods.length === 0 ? (
        <EmptyState>No Special Peak periods yet. Normal seasonal rates apply all year.</EmptyState>
      ) : (
        <div className="space-y-6">
          {config.specialPeakPeriods.map((period) => (
            <div key={period.id} className="border border-border rounded-xl p-4">
              <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-muted-foreground block mb-1">Name</label>
                  <SavingInput
                    value={period.name}
                    ariaLabel="Period name"
                    onSave={async (v) => {
                      await updateRecord('special-peak-periods', { id: period.id, name: v });
                      await reload();
                    }}
                  />
                </div>
                <div className="w-40">
                  <label className="text-xs text-muted-foreground block mb-1">From</label>
                  <SavingInput
                    type="date"
                    value={period.startDate?.slice(0, 10) ?? ''}
                    ariaLabel="Start date"
                    onSave={async (v) => {
                      await updateRecord('special-peak-periods', { id: period.id, startDate: v });
                      await reload();
                    }}
                  />
                </div>
                <div className="w-40">
                  <label className="text-xs text-muted-foreground block mb-1">To</label>
                  <SavingInput
                    type="date"
                    value={period.endDate?.slice(0, 10) ?? ''}
                    ariaLabel="End date"
                    onSave={async (v) => {
                      await updateRecord('special-peak-periods', { id: period.id, endDate: v });
                      await reload();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <SavingToggle
                    checked={period.isActive}
                    label={`${period.name} active`}
                    onSave={async (next) => {
                      await updateRecord('special-peak-periods', {
                        id: period.id,
                        isActive: next,
                      });
                      await reload();
                    }}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${period.name}" and its rates?`)) return;
                    await deleteRecord('special-peak-periods', period.id);
                    await reload();
                  }}
                  className="h-9 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3 font-medium">Cottage</th>
                      <th className="py-2 pr-3 font-medium">Adults</th>
                      <th className="py-2 pr-3 font-medium">Flat rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cottages.map((cottage) => {
                      const tiers = Array.from(
                        { length: cottage.maxAdults - cottage.baseAdults + 1 },
                        (_, i) => cottage.baseAdults + i
                      );
                      return tiers.map((adults, idx) => {
                        const rate = config.specialPeakRates.find(
                          (r) =>
                            r.periodId === period.id &&
                            r.cottageId === cottage.id &&
                            r.adults === adults
                        );
                        return (
                          <tr
                            key={`${period.id}-${cottage.id}-${adults}`}
                            className="border-b border-border/50"
                          >
                            <td className="py-2 pr-3">
                              {idx === 0 && <span className="text-foreground">{cottage.name}</span>}
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground">{adults}</td>
                            <td className="py-2 pr-3 w-32">
                              <SavingInput
                                type="number"
                                min={0}
                                prefix="₹"
                                value={rate?.rate ?? ''}
                                ariaLabel={`${cottage.name} ${adults} adults special peak rate`}
                                onSave={async (v) => {
                                  const value = Math.round(Number(v));
                                  if (!Number.isFinite(value) || value < 0) {
                                    throw new Error('Enter a whole number of rupees');
                                  }
                                  if (rate) {
                                    await updateRecord('special-peak-rates', {
                                      id: rate.id,
                                      rate: value,
                                    });
                                  } else {
                                    await createRecord('special-peak-rates', {
                                      periodId: period.id,
                                      cottageId: cottage.id,
                                      adults,
                                      rate: value,
                                    });
                                  }
                                  await reload();
                                }}
                              />
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A cottage left blank here falls back to its normal seasonal rate for these dates.
              </p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
