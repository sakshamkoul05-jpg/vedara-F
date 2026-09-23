'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Section, SavingInput, SavingSelect, SavingToggle, EmptyState } from './components';
import { createRecord, deleteRecord, saveSettings, updateRecord } from './api';
import { DAY_NAMES, SEASON_TYPES, type AdminPricingConfig, type SeasonType } from './types';

/** Stay 4, Pay 3 and any other long-stay benefit (spec §7). */
export function LongStayTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const [blackoutDraft, setBlackoutDraft] = useState<Record<string, string>>({});

  const num = (raw: string, label: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v < 1) throw new Error(`${label} must be at least 1`);
    return v;
  };

  return (
    <Section
      title="Long stay benefit"
      specRef="Spec §7"
      description="For an eligible consecutive stay, the lowest-priced eligible accommodation night is complimentary. Only the room component is free — breakfast, mattress and other add-ons remain payable on every night."
      actions={
        <button
          onClick={async () => {
            await createRecord('long-stay-rules', {
              name: 'New long stay offer',
              nightsRequired: 4,
              nightsCharged: 3,
              enabledSeasonTypes: ['VALUE', 'REGULAR'],
              cottageIds: [],
              blackoutDates: [],
              stackableWithCoupon: false,
              isActive: false,
            });
            await reload();
          }}
          className="cta-primary cta-sm"
        >
          <Plus className="w-4 h-4" /> Add rule
        </button>
      }
    >
      {config.longStayRules.length === 0 ? (
        <EmptyState>No long-stay rules configured.</EmptyState>
      ) : (
        <div className="space-y-5">
          {config.longStayRules.map((rule) => (
            <div key={rule.id} className="border border-border rounded-xl p-4">
              <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs text-muted-foreground block mb-1">Name</label>
                  <SavingInput
                    value={rule.name}
                    ariaLabel="Rule name"
                    onSave={async (v) => {
                      await updateRecord('long-stay-rules', { id: rule.id, name: v });
                      await reload();
                    }}
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground block mb-1">Nights stayed</label>
                  <SavingInput
                    type="number"
                    min={2}
                    value={rule.nightsRequired}
                    ariaLabel="Nights required"
                    onSave={async (v) => {
                      await updateRecord('long-stay-rules', {
                        id: rule.id,
                        nightsRequired: num(v, 'Nights stayed'),
                      });
                      await reload();
                    }}
                  />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground block mb-1">Nights paid</label>
                  <SavingInput
                    type="number"
                    min={1}
                    value={rule.nightsCharged}
                    ariaLabel="Nights charged"
                    onSave={async (v) => {
                      await updateRecord('long-stay-rules', {
                        id: rule.id,
                        nightsCharged: num(v, 'Nights paid'),
                      });
                      await reload();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <SavingToggle
                    checked={rule.isActive}
                    label={`${rule.name} active`}
                    onSave={async (next) => {
                      await updateRecord('long-stay-rules', { id: rule.id, isActive: next });
                      await reload();
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Stacks with coupon</span>
                  <SavingToggle
                    checked={rule.stackableWithCoupon}
                    label={`${rule.name} stacks with coupon`}
                    onSave={async (next) => {
                      await updateRecord('long-stay-rules', {
                        id: rule.id,
                        stackableWithCoupon: next,
                      });
                      await reload();
                    }}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${rule.name}"?`)) return;
                    await deleteRecord('long-stay-rules', rule.id);
                    await reload();
                  }}
                  className="h-9 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="w-40">
                  <label className="text-xs text-muted-foreground block mb-1">Valid from</label>
                  <SavingInput
                    type="date"
                    value={rule.validFrom?.slice(0, 10) ?? ''}
                    ariaLabel="Valid from"
                    onSave={async (v) => {
                      await updateRecord('long-stay-rules', { id: rule.id, validFrom: v || null });
                      await reload();
                    }}
                  />
                </div>
                <div className="w-40">
                  <label className="text-xs text-muted-foreground block mb-1">Valid to</label>
                  <SavingInput
                    type="date"
                    value={rule.validTo?.slice(0, 10) ?? ''}
                    ariaLabel="Valid to"
                    onSave={async (v) => {
                      await updateRecord('long-stay-rules', { id: rule.id, validTo: v || null });
                      await reload();
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground pb-2">Leave blank for no limit.</p>
                <div className="flex items-center gap-2 pb-1">
                  <SavingToggle
                    checked={Boolean(rule.stackableWithOffers)}
                    label={`${rule.name} stacks with last-minute offers`}
                    onSave={async (next) => {
                      await updateRecord('long-stay-rules', { id: rule.id, stackableWithOffers: next });
                      await reload();
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Stacks with last-minute room discount</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Available in seasons
                </label>
                <div className="flex flex-wrap gap-2">
                  {([...SEASON_TYPES, 'SPECIAL_PEAK'] as SeasonType[]).map((type) => {
                    const on = rule.enabledSeasonTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={on}
                        onClick={async () => {
                          const next = on
                            ? rule.enabledSeasonTypes.filter((t) => t !== type)
                            : [...rule.enabledSeasonTypes, type];
                          await updateRecord('long-stay-rules', {
                            id: rule.id,
                            enabledSeasonTypes: next,
                          });
                          await reload();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                          on
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Recommended: Value and Regular enabled, High admin-controlled, Peak and Special
                  Peak normally disabled.
                </p>
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Limited to cottages
                </label>
                <div className="flex flex-wrap gap-2">
                  {config.cottages.map((cottage) => {
                    const on = rule.cottageIds.includes(cottage.id);
                    return (
                      <button
                        key={cottage.id}
                        type="button"
                        aria-pressed={on}
                        onClick={async () => {
                          const next = on
                            ? rule.cottageIds.filter((id) => id !== cottage.id)
                            : [...rule.cottageIds, cottage.id];
                          await updateRecord('long-stay-rules', { id: rule.id, cottageIds: next });
                          await reload();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                          on
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {cottage.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Select none to apply the benefit to every cottage.
                </p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Blackout dates</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {rule.blackoutDates.length === 0 && (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                  {rule.blackoutDates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-earth-50 dark:bg-white/5 text-xs text-foreground border border-border"
                    >
                      {date}
                      <button
                        aria-label={`Remove blackout ${date}`}
                        onClick={async () => {
                          await updateRecord('long-stay-rules', {
                            id: rule.id,
                            blackoutDates: rule.blackoutDates.filter((d) => d !== date),
                          });
                          await reload();
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="date"
                    aria-label="Blackout date to add"
                    value={blackoutDraft[rule.id] ?? ''}
                    onChange={(e) =>
                      setBlackoutDraft((prev) => ({ ...prev, [rule.id]: e.target.value }))
                    }
                    className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
                  />
                  <button
                    onClick={async () => {
                      const date = blackoutDraft[rule.id];
                      if (!date || rule.blackoutDates.includes(date)) return;
                      await updateRecord('long-stay-rules', {
                        id: rule.id,
                        blackoutDates: [...rule.blackoutDates, date].sort(),
                      });
                      setBlackoutDraft((prev) => ({ ...prev, [rule.id]: '' }));
                      await reload();
                    }}
                    className="h-9 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-earth-50 dark:hover:bg-white/5"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/** Inventory-pressure uplift (spec §8) and the global switches (spec §15). */
export function DemandTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const settings = config.settings;
  const activeCottages = config.cottages.filter((c) => c.isActive).length;

  const pct = (raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v) || v < 0 || v > 100) throw new Error('Enter a percentage from 0 to 100');
    return v;
  };

  const ratio = (raw: string) => {
    const v = Number(raw);
    if (!Number.isFinite(v) || v < 0 || v > 1.01) throw new Error('Enter a ratio between 0 and 1');
    return v;
  };

  return (
    <Section
      title="Inventory-based dynamic pricing"
      specRef="Spec §8"
      description="Raises the room rate as cottages fill up. Thresholds are stored as a booked ratio so they keep working as inventory changes. Add-ons are never uplifted."
      actions={
        <button
          onClick={async () => {
            await createRecord('inventory-tiers', {
              minBookedRatio: 0.9,
              maxBookedRatio: 1.01,
              upliftPercent: 25,
              isActive: false,
            });
            await reload();
          }}
          className="cta-primary cta-sm"
        >
          <Plus className="w-4 h-4" /> Add tier
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-6 mb-5 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <SavingToggle
            checked={settings.inventoryPricingEnabled ?? false}
            label="Inventory pricing enabled"
            onSave={async (next) => {
              await saveSettings({ inventoryPricingEnabled: next });
              await reload();
            }}
          />
          <span className="text-sm text-foreground">Feature enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Uplift ceiling</span>
          <div className="w-24">
            <SavingInput
              type="number"
              min={0}
              max={100}
              suffix="%"
              value={settings.inventoryUpliftCeilingPercent ?? 20}
              ariaLabel="Uplift ceiling percent"
              onSave={async (v) => {
                await saveSettings({ inventoryUpliftCeilingPercent: pct(v) });
                await reload();
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {activeCottages} cottage{activeCottages === 1 ? '' : 's'} currently bookable.
        </p>
      </div>

      {config.inventoryTiers.length === 0 ? (
        <EmptyState>No tiers configured — the base tariff always applies.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-medium">Booked from</th>
                <th className="py-2 pr-3 font-medium">Booked below</th>
                <th className="py-2 pr-3 font-medium">Uplift</th>
                <th className="py-2 pr-3 font-medium">With {activeCottages} cottages</th>
                <th className="py-2 pr-3 font-medium">Active</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {config.inventoryTiers.map((tier) => {
                const from = Math.ceil(tier.minBookedRatio * activeCottages);
                const to = Math.ceil(tier.maxBookedRatio * activeCottages) - 1;
                return (
                  <tr key={tier.id} className="border-b border-border/50">
                    <td className="py-2 pr-3 w-28">
                      <SavingInput
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={tier.minBookedRatio}
                        ariaLabel="Minimum booked ratio"
                        onSave={async (v) => {
                          await updateRecord('inventory-tiers', {
                            id: tier.id,
                            minBookedRatio: ratio(v),
                          });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 w-28">
                      <SavingInput
                        type="number"
                        step={0.01}
                        min={0}
                        max={1.01}
                        value={tier.maxBookedRatio}
                        ariaLabel="Maximum booked ratio"
                        onSave={async (v) => {
                          await updateRecord('inventory-tiers', {
                            id: tier.id,
                            maxBookedRatio: ratio(v),
                          });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 w-28">
                      <SavingInput
                        type="number"
                        min={0}
                        max={100}
                        suffix="%"
                        value={tier.upliftPercent}
                        ariaLabel="Uplift percent"
                        onSave={async (v) => {
                          await updateRecord('inventory-tiers', {
                            id: tier.id,
                            upliftPercent: pct(v),
                          });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {to >= from ? `${from}–${to} booked` : `${from} booked`}
                    </td>
                    <td className="py-2 pr-3">
                      <SavingToggle
                        checked={tier.isActive}
                        label="Tier active"
                        onSave={async (next) => {
                          await updateRecord('inventory-tiers', { id: tier.id, isActive: next });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this tier?')) return;
                          await deleteRecord('inventory-tiers', tier.id);
                          await reload();
                        }}
                        aria-label="Delete tier"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Ranges are inclusive of the lower bound and exclusive of the upper. Use 1.01 as the upper
        bound of the final tier so a fully booked property is included.
      </p>
    </Section>
  );
}

/** GST slabs and the global switches (spec §14, §15). */
export function TaxSettingsTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const settings = config.settings;
  const weekendDays = settings.weekendDays ?? [5, 6, 0];

  const num = (raw: string, label: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v < 0) throw new Error(`${label} must be a whole number`);
    return v;
  };

  return (
    <>
      <Section
        title="GST"
        specRef="Spec §14"
        description="Slabs are matched on the per-night room tariff, so a stay crossing a slab boundary is taxed night by night. Configure the statutory treatment here rather than hard-coding a rate."
        actions={
          <button
            onClick={async () => {
              await createRecord('tax-slabs', {
                name: 'New slab',
                minTariff: 0,
                maxTariff: null,
                ratePercent: 12,
                isActive: false,
              });
              await reload();
            }}
            className="cta-primary cta-sm"
          >
            <Plus className="w-4 h-4" /> Add slab
          </button>
        }
      >
        {config.taxSlabs.length === 0 ? (
          <EmptyState>No tax slabs configured — quotes will show zero GST.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Tariff from</th>
                  <th className="py-2 pr-3 font-medium">Tariff to</th>
                  <th className="py-2 pr-3 font-medium">Rate</th>
                  <th className="py-2 pr-3 font-medium">Active</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {config.taxSlabs.map((slab) => (
                  <tr key={slab.id} className="border-b border-border/50">
                    <td className="py-2 pr-3 w-36">
                      <SavingInput
                        value={slab.name}
                        ariaLabel="Slab name"
                        onSave={async (v) => {
                          await updateRecord('tax-slabs', { id: slab.id, name: v });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 w-32">
                      <SavingInput
                        type="number"
                        min={0}
                        prefix="₹"
                        value={slab.minTariff}
                        ariaLabel="Minimum tariff"
                        onSave={async (v) => {
                          await updateRecord('tax-slabs', {
                            id: slab.id,
                            minTariff: num(v, 'Minimum tariff'),
                          });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 w-32">
                      <SavingInput
                        type="number"
                        min={0}
                        prefix="₹"
                        placeholder="No limit"
                        value={slab.maxTariff ?? ''}
                        ariaLabel="Maximum tariff"
                        onSave={async (v) => {
                          await updateRecord('tax-slabs', {
                            id: slab.id,
                            maxTariff: v.trim() === '' ? null : num(v, 'Maximum tariff'),
                          });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3 w-24">
                      <SavingInput
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        suffix="%"
                        value={slab.ratePercent}
                        ariaLabel="Rate percent"
                        onSave={async (v) => {
                          const r = Number(v);
                          if (!Number.isFinite(r) || r < 0 || r > 100) {
                            throw new Error('Enter a percentage from 0 to 100');
                          }
                          await updateRecord('tax-slabs', { id: slab.id, ratePercent: r });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <SavingToggle
                        checked={slab.isActive}
                        label={`${slab.name} active`}
                        onSave={async (next) => {
                          await updateRecord('tax-slabs', { id: slab.id, isActive: next });
                          await reload();
                        }}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete "${slab.name}"?`)) return;
                          await deleteRecord('tax-slabs', slab.id);
                          await reload();
                        }}
                        aria-label={`Delete ${slab.name}`}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section
        title="Global settings"
        specRef="Spec §15"
        description="Switches and scalars that apply across the whole engine."
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Weekend days</label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((day, i) => {
                const on = weekendDays.includes(i);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={async () => {
                      const next = on
                        ? weekendDays.filter((d) => d !== i)
                        : [...weekendDays, i].sort();
                      await saveSettings({ weekendDays: next });
                      await reload();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                      on
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Nights falling on these days use the weekend rate.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">
              Extra mattress price (global default)
            </label>
            <div className="w-40">
              <SavingInput
                type="number"
                min={0}
                prefix="₹"
                value={settings.extraMattressPrice ?? 1250}
                ariaLabel="Extra mattress price"
                onSave={async (v) => {
                  await saveSettings({ extraMattressPrice: num(v, 'Price') });
                  await reload();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Per night. A cottage may override this on the Cottages tab.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Adult age threshold</label>
            <div className="w-40">
              <SavingInput
                type="number"
                min={1}
                max={30}
                suffix="years"
                value={settings.adultAgeThreshold ?? 12}
                ariaLabel="Adult age threshold"
                onSave={async (v) => {
                  await saveSettings({ adultAgeThreshold: num(v, 'Age') });
                  await reload();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Guests at or above this age count as adults for occupancy and tariff.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Rounding</label>
            <div className="w-56">
              <SavingSelect
                value={settings.roundingMode ?? 'NEAREST_RUPEE'}
                ariaLabel="Rounding mode"
                options={[
                  { value: 'NONE', label: 'None (exact paise)' },
                  { value: 'NEAREST_RUPEE', label: 'Nearest rupee' },
                  { value: 'NEAREST_TEN', label: 'Nearest ₹10' },
                ]}
                onSave={async (v) => {
                  await saveSettings({ roundingMode: v });
                  await reload();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Applied to the final payable amount only.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Minimum stay (all dates)</label>
            <div className="w-40">
              <SavingInput
                type="number"
                min={1}
                max={30}
                suffix="nights"
                value={settings.minStayNights ?? 1}
                ariaLabel="Global minimum stay"
                onSave={async (v) => {
                  await saveSettings({ minStayNights: num(v, 'Minimum stay') || 1 });
                  await reload();
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              A floor for every stay. Seasons and Special Peak periods can require more.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SavingToggle
              checked={settings.longStayEnabled ?? true}
              label="Long stay benefit enabled"
              onSave={async (next) => {
                await saveSettings({ longStayEnabled: next });
                await reload();
              }}
            />
            <div>
              <p className="text-sm text-foreground">Long stay benefit</p>
              <p className="text-[11px] text-muted-foreground">
                Master switch for every long-stay rule.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
