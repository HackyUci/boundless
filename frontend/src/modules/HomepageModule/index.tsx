import React from 'react'
import { GetStartedSection } from './sections/GetStartedSection'
import { ProductValuesSection } from './sections/ProductValuesSection'
import { ProcedureSection } from './sections/UserProcedure'
import { Footer } from '@/components/Footer'

export const HomepageModule = () => {
  return (
    <div>
      <GetStartedSection />
      <ProductValuesSection />
      <ProcedureSection />
      <Footer />
    </div>
  )
}
