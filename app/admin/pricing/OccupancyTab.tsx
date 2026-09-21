'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Section, SavingInput, SavingSelect, SavingToggle, EmptyState } from './components';
import { createRecord, deleteRecord, updateRecord } from './api';
import { CATEGORIES, type AdminPricingConfig } from './types';

/**
 * Cottage occupancy, bedding and the public descriptor (spec §1, §5, §12).
 * These settings decide which cottages a party can even see.
 */
export function CottagesTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const save = async (id: string, field: string, value: unknown) => {
    await updateRecord('cottages', { id, [field]: value });
    await reload();
  };

  const num = (raw: string, label: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v < 0) throw new Error(`${label} must be a whole number`);
    return v;
  };

  return (
    <Section
      title="Cottages — occupancy & bedding"
      specRef="Spec §1, §5, §11"
      description="Maximum adults and total guests per cottage, and whether an extra mattress may be offered. A cottage with no pricing category is excluded from the booking engine entirely."
    >
      <div className="space-y-4">
        {config.cottages.map((cottage) => (
          <div key={cottage.id} className="border border-border rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-foreground font-medium">{cottage.name}</h3>
                <p className="text-[11px] text-muted-foreground">{cottage.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Bookable</span>
                <SavingToggle
                  checked={cottage.isActive}
                  label={`${cottage.name} bookable`}
                  onSave={(next) => save(cottage.id, 'isActive', next)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category</label>
                <SavingSelect
                  value={cottage.pricingCategory ?? ''}
                  ariaLabel={`${cottage.name} category`}
                  options={[
                    { value: '', label: 'Not configured' },
                    ...CATEGORIES.map((c) => ({ value: c, label: c })),
                  ]}
                  onSave={(v) => save(cottage.id, 'pricingCategory', v || null)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Base adults</label>
                <SavingInput
                  type="number"
                  min={1}
                  value={cottage.baseAdults}
                  ariaLabel={`${cottage.name} base adults`}
                  onSave={(v) => save(cottage.id, 'baseAdults', num(v, 'Base adults'))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max adults</label>
                <SavingInput
                  type="number"
                  min={1}
                  value={cottage.maxAdults}
                  ariaLabel={`${cottage.name} max adults`}
                  onSave={(v) => save(cottage.id, 'maxAdults', num(v, 'Max adults'))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max total guests</label>
                <SavingInput
                  type="number"
                  min={1}
                  value={cottage.maxOccupancy}
                  ariaLabel={`${cottage.name} max occupancy`}
                  onSave={(v) => save(cottage.id, 'maxOccupancy', num(v, 'Max occupancy'))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 items-end">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Extra mattress</label>
                <div className="h-9 flex items-center">
                  <SavingToggle
                    checked={cottage.allowsExtraMattress}
                    label={`${cottage.name} allows extra mattress`}
                    onSave={(next) => save(cottage.id, 'allowsExtraMattress', next)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max mattresses</label>
                <SavingInput
                  type="number"
                  min={0}
                  max={3}
                  disabled={!cottage.allowsExtraMattress}
                  value={cottage.maxExtraMattresses}
                  ariaLabel={`${cottage.name} max mattresses`}
                  onSave={(v) => save(cottage.id, 'maxExtraMattresses', num(v, 'Max mattresses'))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Mattress price override
                </label>
                <SavingInput
                  type="number"
                  min={0}
                  prefix="₹"
                  placeholder="Use global"
                  disabled={!cottage.allowsExtraMattress}
                  value={cottage.extraMattressPrice ?? ''}
                  ariaLabel={`${cottage.name} mattress price`}
                  onSave={(v) =>
                    save(cottage.id, 'extraMattressPrice', v.trim() === '' ? null : num(v, 'Price'))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Public descriptor</label>
                <SavingInput
                  value={cottage.publicDescriptor ?? ''}
                  ariaLabel={`${cottage.name} public descriptor`}
                  placeholder="Boutique Cottage | 2 Adults"
                  onSave={(v) => save(cottage.id, 'publicDescriptor', v || null)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/** Breakfast supplements and the child/bedding policy (spec §3.2, §4). */
export function GuestPolicyTab({
  config,
  reload,
}: {
  config: AdminPricingConfig;
  reload: () => Promise<void>;
}) {
  const num = (raw: string, label: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v < 0) throw new Error(`${label} must be a whole number`);
    return v;
  };

  return (
    <>
      <Section
        title="Breakfast supplements"
        specRef="Spec §3.2"
        description="Charged per person per night on the Breakfast Included plan, matched on the guest's age. Breakfast stays payable on the complimentary Stay 4 Pay 3 night."
        actions={
          <button
            onClick={async () => {
              await createRecord('breakfast-bands', {
                label: 'New band',
                minAge: 0,
                maxAge: 5,
                pricePerNight: 0,
                isActive: true,
              });
              await reload();
            }}
            className="cta-primary cta-sm"
          >
            <Plus className="w-4 h-4" /> Add band
          </button>
        }
      >
        {config.breakfastBands.length === 0 ? (
          <EmptyState>No breakfast bands configured — the Breakfast Included plan will fail.</EmptyState>
        ) : (
          <AgeBandTable
            rows={config.breakfastBands.map((b) => ({
              id: b.id,
              label: b.label,
              minAge: b.minAge,
              maxAge: b.maxAge,
              isActive: b.isActive,
              extra: (
                <SavingInput
                  type="number"
                  min={0}
                  prefix="₹"
                  value={b.pricePerNight}
                  ariaLabel={`${b.label} price per night`}
                  onSave={async (v) => {
                    await updateRecord('breakfast-bands', {
                      id: b.id,
                      pricePerNight: num(v, 'Price'),
                    });
                    await reload();
                  }}
                />
              ),
            }))}
            extraHeader="Per night"
            resource="breakfast-bands"
            reload={reload}
          />
        )}
        <p className="text-xs text-muted-foreground mt-3">
          The band whose minimum age is at or above the adult age threshold is treated as the adult
          rate.
        </p>
      </Section>

      <Section
        title="Child & bedding policy"
        specRef="Spec §4"
        description="How a child's age is treated. 'Counts as adult' promotes the guest into the adult occupancy count, which is what triggers the 3rd and 4th adult increments."
        actions={
          <button
            onClick={async () => {
              await createRecord('child-bands', {
                label: 'New band',
                minAge: 0,
                maxAge: 5,
                chargedAsAdult: false,
                accommodationCharge: 0,
                isActive: true,
              });
              await reload();
            }}
            className="cta-primary cta-sm"
          >
            <Plus className="w-4 h-4" /> Add band
          </button>
        }
      >
        {config.childBands.length === 0 ? (
          <EmptyState>No child bands configured.</EmptyState>
        ) : (
          <AgeBandTable
            rows={config.childBands.map((b) => ({
              id: b.id,
              label: b.label,
              minAge: b.minAge,
              maxAge: b.maxAge,
              isActive: b.isActive,
              extra: (
                <div className="flex items-center gap-3">
                  <div className="w-28">
                    <SavingInput
                      type="number"
                      min={0}
                      prefix="₹"
                      value={b.accommodationCharge}
                      ariaLabel={`${b.label} accommodation charge`}
                      onSave={async (v) => {
                        await updateRecord('child-bands', {
                          id: b.id,
                          accommodationCharge: num(v, 'Charge'),
                        });
                        await reload();
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SavingToggle
                      checked={b.chargedAsAdult}
                      label={`${b.label} counts as adult`}
                      onSave={async (next) => {
                        await updateRecord('child-bands', { id: b.id, chargedAsAdult: next });
                        await reload();
                      }}
                    />
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      as adult
                    </span>
                  </div>
                </div>
              ),
            }))}
            extraHeader="Accommodation / status"
            resource="child-bands"
            reload={reload}
          />
        )}
      </Section>
    </>
  );
}

function AgeBandTable({
  rows,
  extraHeader,
  resource,
  reload,
}: {
  rows: {
    id: string;
    label: string;
    minAge: number;
    maxAge: number;
    isActive: boolean;
    extra: React.ReactNode;
  }[];
  extraHeader: string;
  resource: string;
  reload: () => Promise<void>;
}) {
  const age = (raw: string) => {
    const v = Math.round(Number(raw));
    if (!Number.isFinite(v) || v < 0 || v > 120) throw new Error('Age must be between 0 and 120');
    return v;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[620px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="py-2 pr-3 font-medium">Label</th>
            <th className="py-2 pr-3 font-medium">From age</th>
            <th className="py-2 pr-3 font-medium">To age</th>
            <th className="py-2 pr-3 font-medium">{extraHeader}</th>
            <th className="py-2 pr-3 font-medium">Active</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50">
              <td className="py-2 pr-3 w-48">
                <SavingInput
                  value={row.label}
                  ariaLabel="Band label"
                  onSave={async (v) => {
                    await updateRecord(resource, { id: row.id, label: v });
                    await reload();
                  }}
                />
              </td>
              <td className="py-2 pr-3 w-24">
                <SavingInput
                  type="number"
                  min={0}
                  max={120}
                  value={row.minAge}
                  ariaLabel="Minimum age"
                  onSave={async (v) => {
                    await updateRecord(resource, { id: row.id, minAge: age(v) });
                    await reload();
                  }}
                />
              </td>
              <td className="py-2 pr-3 w-24">
                <SavingInput
                  type="number"
                  min={0}
                  max={120}
                  value={row.maxAge}
                  ariaLabel="Maximum age"
                  onSave={async (v) => {
                    await updateRecord(resource, { id: row.id, maxAge: age(v) });
                    await reload();
                  }}
                />
              </td>
              <td className="py-2 pr-3">{row.extra}</td>
              <td className="py-2 pr-3">
                <SavingToggle
                  checked={row.isActive}
                  label={`${row.label} active`}
                  onSave={async (next) => {
                    await updateRecord(resource, { id: row.id, isActive: next });
                    await reload();
                  }}
                />
              </td>
              <td className="py-2">
                <button
                  onClick={async () => {
                    if (!confirm(`Delete "${row.label}"?`)) return;
                    await deleteRecord(resource, row.id);
                    await reload();
                  }}
                  aria-label={`Delete ${row.label}`}
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
  );
}
