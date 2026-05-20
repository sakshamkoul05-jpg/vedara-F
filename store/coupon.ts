import { create } from 'zustand'
import { endpoints } from '@/services/api'

interface CouponState {
  code: string
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED' | null
  isValid: boolean
  error: string | null
  loading: boolean
  setCode: (code: string) => void
  validateCoupon: (code: string, amount: number) => Promise<void>
  removeCoupon: () => void
}

export const useCouponStore = create<CouponState>((set) => ({
  code: '',
  discount: 0,
  discountType: null,
  isValid: false,
  error: null,
  loading: false,
  setCode: (code) => set({ code, error: null, isValid: false, discount: 0, discountType: null }),
  validateCoupon: async (code, amount) => {
    if (!code.trim()) {
      set({ error: 'Please enter a coupon code', isValid: false, discount: 0, discountType: null, loading: false })
      return
    }
    set({ loading: true, error: null })
    try {
      const res = await endpoints.cms.validateCoupon(code, amount)
      if (res.valid) {
        set({
          code,
          discount: res.discount,
          discountType: res.discountType,
          isValid: true,
          error: null,
          loading: false,
        })
      } else {
        set({ error: res.error || 'Invalid coupon', isValid: false, discount: 0, discountType: null, loading: false })
      }
    } catch {
      set({ error: 'Failed to validate coupon', isValid: false, discount: 0, discountType: null, loading: false })
    }
  },
  removeCoupon: () => set({
    code: '',
    discount: 0,
    discountType: null,
    isValid: false,
    error: null,
    loading: false,
  }),
}))
