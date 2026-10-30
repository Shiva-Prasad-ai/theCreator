'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Product, Company, Match } from '@/lib/beluga/types'
import { ProductForm } from './product-form'
import { CompanyRadar } from './company-radar'
import { MapRadar } from './map-radar'
import { PitchBriefEditor } from './pitch-brief-editor'
import { FollowUpForm } from './follow-up-form'
import { Button } from '@/components/ui/button'
import {
  Compass,
  Package,
  Plus,
  Edit2,
  Calendar,
  CheckCircle2,
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  AlertTriangle,
  Globe2,
} from 'lucide-react'

interface BelugaWorkspaceProps {
  initialProducts: Product[]
  companies: Company[]
  initialMatches: Match[]
  isDevFallback?: boolean
}

export function BelugaWorkspace({
  initialProducts,
  companies,
  initialMatches,
  isDevFallback,
}: BelugaWorkspaceProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [companyList, setCompanyList] = useState<Company[]>(companies)
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProducts[0]?.id || ''
  )
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'radar' | 'matches' | 'followups'>('map')

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]

  // Filter matches for the currently selected product
  const productMatches = matches.filter((m) => m.product_id === selectedProduct?.id)

  const handleProductCreatedOrUpdated = (savedProduct: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === savedProduct.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = savedProduct
        return copy
      }
      return [savedProduct, ...prev]
    })
    setSelectedProductId(savedProduct.id)
    setIsProductFormOpen(false)
    setEditingProduct(null)
  }

  const handleSelectMatch = (match: Match) => {
    setActiveMatch(match)
  }

  const handleMatchUpdated = (updatedMatch: Match) => {
    setMatches((prev) => {
      const idx = prev.findIndex((m) => m.id === updatedMatch.id)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], ...updatedMatch }
        return copy
      }
      return [updatedMatch, ...prev]
    })
    if (activeMatch?.id === updatedMatch.id) {
      setActiveMatch((prev) => (prev ? { ...prev, ...updatedMatch } : updatedMatch))
    }
  }

  return (
    <div className="space-y-6">
      {/* Dev Preview Mode Persistent Banner */}
      {isDevFallback && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Preview mode: data is not saved</span>
        </div>
      )}

      {/* Header Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold hover:bg-muted text-foreground transition-colors h-7"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Return to Dashboard
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Compass className="h-3 w-3" />
              <span>Beluga Lead & Company Radar</span>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
              Product Exclusive
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            B2B Partner & Buyer Discovery
          </h2>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Discover potential distributors, enterprise buyers, and media partners for your products. Score candidate companies, prioritize outreach tiers, and generate custom AI pitch briefs.
          </p>
        </div>

        {/* Product Switcher & Create Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {products.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs">
              <Package className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  setSelectedProductId(e.target.value)
                  setActiveMatch(null)
                }}
                className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null)
              setIsProductFormOpen(true)
            }}
            className="text-xs font-semibold"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Product
          </Button>
        </div>
      </div>

      {/* Product Form Modal / Section */}
      {isProductFormOpen && (
        <ProductForm
          product={editingProduct}
          onSuccess={handleProductCreatedOrUpdated}
          onCancel={() => {
            setIsProductFormOpen(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* When no products exist yet */}
      {products.length === 0 && !isProductFormOpen ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Products Registered Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Beluga needs at least one creator product with an ICP description to calculate deterministic match scores and scout candidate companies.
          </p>
          <Button onClick={() => setIsProductFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Register First Product
          </Button>
        </div>
      ) : selectedProduct ? (
        <div className="space-y-6">
            {/* Active Product Details Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">
                      {selectedProduct.name}
                    </h3>
                    {selectedProduct.industry && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {selectedProduct.industry}
                      </span>
                    )}
                  </div>
                  {selectedProduct.icp && (
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground font-semibold">ICP Target:</strong>{' '}
                      {selectedProduct.icp}
                    </p>
                  )}
                  {selectedProduct.description && (
                    <p className="text-xs text-muted-foreground pt-0.5">
                      {selectedProduct.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(selectedProduct)
                      setIsProductFormOpen(true)
                    }}
                    className="text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Edit Specs
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                Map Radar View ({companyList.length} Buyers)
              </button>

              <button
                onClick={() => setActiveTab('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'radar'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                Prospect Cards
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'matches'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved Matches ({productMatches.length})
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'followups'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Follow-ups ({matches.filter((m) => m.follow_up_at).length})
              </button>
            </div>

            {/* Content Area */}
            {activeTab === 'map' ? (
              <MapRadar
                product={selectedProduct}
                companies={companyList}
                matches={productMatches}
                onSelectMatch={(m) => {
                  handleSelectMatch(m)
                  setActiveTab('matches')
                }}
                activeMatchId={activeMatch?.id}
                onCompaniesDiscovered={(newComps) => {
                  setCompanyList((prev) => [...newComps, ...prev])
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left / Main Column */}
                <div
                  className={`${
                    activeMatch ? 'lg:col-span-7' : 'lg:col-span-12'
                  } space-y-4`}
                >
                  {activeTab === 'radar' && (
                    <CompanyRadar
                      product={selectedProduct}
                      companies={companyList}
                      matches={matches}
                      onSelectMatch={handleSelectMatch}
                      activeMatchId={activeMatch?.id}
                    />
                  )}

                {activeTab === 'matches' && (
                  <div className="space-y-3">
                    {productMatches.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                        <h4 className="font-semibold text-foreground text-sm">No Matches Saved Yet</h4>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                          Browse candidate companies in the Discovery Radar and click &quot;Save Match & Pitch&quot; to begin outreach.
                        </p>
                        <Button size="sm" onClick={() => setActiveTab('radar')}>
                          Open Discovery Radar
                        </Button>
                      </div>
                    ) : (
                      productMatches.map((match) => {
                        const comp =
                          match.company || companies.find((c) => c.id === match.company_id)
                        const isSelected = activeMatch?.id === match.id

                        return (
                          <div
                            key={match.id}
                            className={`rounded-2xl border p-4 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border bg-card hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-foreground text-sm">
                                    {comp?.company || 'Company'}
                                  </h4>
                                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                    Tier: {match.tier}
                                  </span>
                                  {match.follow_up_at && (
                                    <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(match.follow_up_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Score: {match.score} / 100 • Status: {match.call_status || 'not_contacted'}
                                </p>
                              </div>

                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => handleSelectMatch(match)}
                              >
                                {isSelected ? 'Viewing' : 'Open Brief'}
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {activeTab === 'followups' && (
                  <div className="space-y-3">
                    {matches.filter((m) => m.follow_up_at).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                        <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                        <h4 className="font-semibold text-foreground text-sm">No Scheduled Follow-ups</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select any match to set follow-up dates synchronized with your calendar.
                        </p>
                      </div>
                    ) : (
                      matches
                        .filter((m) => m.follow_up_at)
                        .map((match) => {
                          const comp =
                            match.company || companies.find((c) => c.id === match.company_id)
                          const prod =
                            match.product || products.find((p) => p.id === match.product_id)
                          const isSelected = activeMatch?.id === match.id
                          const isOverdue =
                            match.follow_up_at &&
                            new Date(match.follow_up_at).getTime() < Date.now()

                          return (
                            <div
                              key={match.id}
                              className={`rounded-2xl border p-4 transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-border bg-card hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-foreground text-sm">
                                      {comp?.company}
                                    </h4>
                                    <span className="text-xs text-muted-foreground">
                                      for {prod?.name}
                                    </span>
                                    <span
                                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                        isOverdue
                                          ? 'bg-destructive/10 text-destructive'
                                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      }`}
                                    >
                                      {isOverdue ? 'Overdue' : 'Scheduled'}:{' '}
                                      {new Date(match.follow_up_at!).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Status: <strong className="text-foreground">{match.call_status}</strong>
                                  </p>
                                </div>

                                <Button
                                  size="sm"
                                  variant={isSelected ? 'default' : 'outline'}
                                  onClick={() => handleSelectMatch(match)}
                                >
                                  {isSelected ? 'Viewing' : 'Manage Outreach'}
                                </Button>
                              </div>
                            </div>
                          )
                        })
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Match Brief Editor & Follow-up Panel */}
              {activeMatch && (
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Match Workspace
                    </span>
                    <button
                      onClick={() => setActiveMatch(null)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {(() => {
                    const matchCompany =
                      activeMatch.company ||
                      companies.find((c) => c.id === activeMatch.company_id) || {
                        id: activeMatch.company_id,
                        company: 'Target Company',
                        region: 'Global',
                        industry: selectedProduct.industry,
                        headcount: 50,
                        lat: null,
                        lng: null,
                        data_confidence: 'sample' as const,
                        created_at: new Date().toISOString(),
                      }

                    return (
                      <>
                        <PitchBriefEditor
                          product={selectedProduct}
                          company={matchCompany}
                          match={activeMatch}
                          onBriefUpdated={handleMatchUpdated}
                        />

                        <FollowUpForm
                          match={activeMatch}
                          companyName={matchCompany.company}
                          productName={selectedProduct.name}
                          onFollowUpUpdated={handleMatchUpdated}
                        />
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
