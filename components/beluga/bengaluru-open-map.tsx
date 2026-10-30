'use client'

import React, { useEffect, useRef } from 'react'
import { Company } from '@/lib/beluga/types'
import { getValidIndiaCoords } from '@/lib/beluga/utils'
import 'leaflet/dist/leaflet.css'

interface BengaluruOpenMapProps {
  companies: Company[]
  selectedCompanyId: string | null
  onSelectCompany: (company: Company) => void
}

export function BengaluruOpenMap({
  companies,
  selectedCompanyId,
  onSelectCompany,
}: BengaluruOpenMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    let isCancelled = false

    if (!mapContainerRef.current) return

    // Dynamic import to ensure window is defined in browser
    import('leaflet').then((L) => {
      if (isCancelled || !mapContainerRef.current) return

      // Clean up any existing map or stale Leaflet ID on this DOM node
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id
      }

      // Base coordinates: Bengaluru, India (Silicon Valley of India)
      const blrLat = 12.9716
      const blrLng = 77.5946

      // India geographical bounds to prevent panning outside India
      const indiaBounds = L.latLngBounds(
        L.latLng(6.5, 68.0),
        L.latLng(37.5, 97.5)
      )

      const map = L.map(mapContainerRef.current, {
        center: [blrLat, blrLng],
        zoom: 12,
        zoomControl: false,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 0.85,
        minZoom: 4,
      })

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // OpenStreetMap standard tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Bengaluru Base',
      }).addTo(map)

      mapInstanceRef.current = map
      renderMarkers(L, map)
    })

    return () => {
      isCancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id
      }
    }
  }, [])

  // Re-render markers whenever companies or selectedCompanyId changes
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) {
        renderMarkers(L, mapInstanceRef.current)
      }
    })
  }, [companies, selectedCompanyId])

  const renderMarkers = (L: any, map: any) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const bounds: any[] = []

    companies.forEach((company) => {
      const coords = getValidIndiaCoords(company.lat, company.lng)
      if (!coords) {
        // No map pin if coordinates are missing or outside India
        return
      }

      const [lat, lng] = coords
      const isSelected = selectedCompanyId === company.id

      const score = company.ai_score ?? 75
      const isHigh = score >= 75
      const isMid = score >= 50 && score < 75

      const colorClass = isHigh
        ? 'bg-emerald-500 border-emerald-300 text-white shadow-emerald-500/50'
        : isMid
        ? 'bg-amber-500 border-amber-300 text-white shadow-amber-500/50'
        : 'bg-slate-600 border-slate-400 text-slate-100 shadow-slate-600/50'

      const ringClass = isSelected
        ? 'ring-4 ring-primary ring-offset-2 scale-125 z-50 animate-bounce'
        : ''

      // Custom high-tech glowing radar pin with score badge
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-125 ${ringClass}">
            <div class="absolute w-8 h-8 rounded-full ${colorClass} opacity-30 animate-ping"></div>
            <div class="w-8 h-8 rounded-full border-2 ${colorClass} shadow-md flex items-center justify-center font-bold text-[11px]">
              ${score}
            </div>
          </div>
        `,
      })

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

      // Tooltip on hover
      marker.bindTooltip(
        `<strong>${company.company}</strong><br/><span style="font-size: 10px; color: #64748b;">${company.industry || 'Technology'} • ${company.approx_location || 'Location unknown'}</span>`,
        { direction: 'top', offset: [0, -14], opacity: 0.95 }
      )

      marker.on('click', () => {
        onSelectCompany(company)
        map.panTo([lat, lng], { animate: true })
      })

      markersRef.current.push(marker)
      bounds.push([lat, lng])
    })

    // If multiple companies exist, auto fit bounds
    if (bounds.length > 1 && !selectedCompanyId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }

  const handleResetToBengaluru = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView([12.9716, 77.5946], 12, { animate: true })
  }

  const handleFitAll = () => {
    if (!mapInstanceRef.current || companies.length === 0) return
    const validCoords = companies
      .map((c) => getValidIndiaCoords(c.lat, c.lng))
      .filter((c): c is [number, number] => c !== null)
    if (validCoords.length > 0) {
      mapInstanceRef.current.fitBounds(validCoords, { padding: [50, 50], maxZoom: 14 })
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border shadow-inner bg-muted/20">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="h-full w-full min-h-[520px] z-10" />

      {/* Floating Map Controls & OpenStreetMap Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-background/95 px-3 py-1.5 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>OpenStreetMap Radar • Bengaluru Base (12.97° N, 77.59° E)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 border-l border-border pl-2 text-[11px] text-muted-foreground">
          <span>{companies.length} prospects mapped</span>
        </div>
      </div>

      {/* Quick view reset buttons */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={handleResetToBengaluru}
          className="rounded-lg border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur hover:bg-muted transition-colors"
        >
          Reset to Bengaluru Center
        </button>
        <button
          onClick={handleFitAll}
          className="rounded-lg border border-border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur hover:bg-muted transition-colors"
        >
          Fit All Prospects
        </button>
      </div>

      {/* Color Legend */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 rounded-xl border border-border/80 bg-background/95 px-3 py-1.5 text-[10px] font-medium shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>High Match (75+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Moderate (50-74)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          <span>Low (&lt;50)</span>
        </div>
      </div>
    </div>
  )
}
