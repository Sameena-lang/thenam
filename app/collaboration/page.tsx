import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CtaBanner from '@/components/CtaBanner'
import CollaborationSection from '@/components/CollaborationSection'

export const metadata: Metadata = {
  title: 'Strategic Collaboration & Partnerships | Thenam Software Solutions',
  description:
    'Collaborate with Thenam Software Solutions. Dedicated engineering pods, startup MVP co-creation, cloud & AI alliances, and academic R&D across Tamil Nadu and globally.',
}

export default function CollaborationPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '70px' }}>
        <CollaborationSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
