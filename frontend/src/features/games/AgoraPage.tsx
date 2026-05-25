import React from 'react'
import { Link } from 'react-router-dom'
import { Swords, Lock } from 'lucide-react'

interface GameCardProps {
  to: string
  sigil: string
  name: string
  tagline: string
  description: string
  available: true
}

interface ComingSoonCardProps {
  sigil: string
  name: string
  tagline: string
  available: false
}

type CardProps = GameCardProps | ComingSoonCardProps

function GameCard(props: GameCardProps) {
  return (
    <Link
      to={props.to}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-stone-700/60 bg-stone-900/80 hover:border-stone-500 hover:bg-stone-800/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="flex items-center gap-4 px-5 pt-5 pb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl group-hover:border-stone-500 transition-colors">
          {props.sigil}
        </div>
        <div className="min-w-0">
          <p className="font-display text-[10px] tracking-[0.25em] uppercase text-amber-500/80 mb-0.5">
            {props.tagline}
          </p>
          <h2 className="font-display text-lg text-stone-100 tracking-wide">{props.name}</h2>
        </div>
      </div>
      <p className="px-5 pb-5 text-sm text-stone-400 leading-relaxed">
        {props.description}
      </p>
      <div className="px-5 pb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 group-hover:text-amber-400 transition-colors">
          Play today's puzzle →
        </span>
      </div>
    </Link>
  )
}

function ComingSoonCard(props: ComingSoonCardProps) {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden border border-stone-800/60 bg-stone-900/40 opacity-60">
      <div className="flex items-center gap-4 px-5 pt-5 pb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center justify-center text-2xl grayscale">
          {props.sigil}
        </div>
        <div className="min-w-0">
          <p className="font-display text-[10px] tracking-[0.25em] uppercase text-stone-600 mb-0.5">
            {props.tagline}
          </p>
          <h2 className="font-display text-lg text-stone-500 tracking-wide">{props.name}</h2>
        </div>
        <div className="ml-auto flex-shrink-0">
          <Lock size={14} className="text-stone-600" />
        </div>
      </div>
      <div className="px-5 pb-5">
        <span className="text-xs text-stone-600">Coming soon</span>
      </div>
    </div>
  )
}

export function AgoraPage() {
  return (
    <div className="min-h-[80vh] px-4 sm:px-6 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Swords size={22} className="text-amber-500/80" strokeWidth={1.5} />
          <p className="font-display text-[10px] tracking-[0.3em] uppercase text-amber-500/80">
            The Agora
          </p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-stone-100 tracking-wide mb-3">
          Games of Wisdom
        </h1>
        <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-md">
          The ancient Agora was where ideas met in open contest. Each game here is an
          encounter — with a concept, a tradition, a question worth sitting with.
        </p>
      </div>

      {/* Available games */}
      <div className="mb-8">
        <p className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-500 mb-4">
          Available now
        </p>
        <div className="flex flex-col gap-4">
          <GameCard
            to="/games/confluence"
            sigil="✦"
            name="Confluence"
            tagline="Daily grouping game"
            description="Sixteen philosophical concepts, four hidden connections across traditions. Group them by finding what binds ideas separated by centuries and continents."
            available={true}
          />
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <p className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-500 mb-4">
          In the porch
        </p>
        <div className="flex flex-col gap-3">
          <ComingSoonCard
            sigil="⚖"
            name="The Duel"
            tagline="Two concepts, one judgment"
            available={false}
          />
          <ComingSoonCard
            sigil="◉"
            name="The Lineage"
            tagline="Trace the chain of influence"
            available={false}
          />
        </div>
      </div>
    </div>
  )
}
