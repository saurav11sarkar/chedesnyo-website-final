import React from 'react'
import HomeHero from './_components/HomeHero'
import ConnectingSection from './_components/ConnectingSection'
import WhyWeDo from './_components/WhyWeDo'
import Benefits from './_components/Benefits'
import LatestAssignments from './_components/LatestAssignments'
import FaqSection from './_components/FaqSection'

function page() {
  return (
    <div>
      <HomeHero />
      <ConnectingSection />
      <WhyWeDo />
      <Benefits />
      <LatestAssignments />
      <FaqSection />
    </div>

    
  )
}

export default page