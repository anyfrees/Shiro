'use client'

import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import { clsxm } from '~/utils/helper'

export interface FABConfig {
  id: string
  icon: JSX.Element
  onClick: () => void
}

class FABStatic {
  private setState: React.Dispatch<React.SetStateAction<FABConfig[]>> | null =
    null
  register(setter: any) {
    this.setState = setter
  }
  destroy() {
    this.setState = null
  }

  add(fabConfig: FABConfig) {
    if (!this.setState) return

    const id = fabConfig.id

    this.setState((state) => {
      if (state.find((config) => config.id === id)) return state
      return [...state, fabConfig]
    })

    return () => {
      this.remove(fabConfig.id)
    }
  }

  remove(id: string) {
    if (!this.setState) return
    this.setState((state) => {
      return state.filter((config) => config.id !== id)
    })
  }
}

const fab = new FABStatic()

export const useFAB = (fabConfig: FABConfig) => {
  useEffect(() => {
    return fab.add(fabConfig)
  }, [])
}

export const FABBase = (
  props: PropsWithChildren<
    {
      id: string
      show?: boolean
      children: JSX.Element
    } & HTMLMotionProps<'button'>
  >,
) => {
  const { children, show = true, ...extra } = props
  const { className, ...rest } = extra

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={clsxm(
            'mt-2 inline-flex h-10 w-10 items-center justify-center',
            'border border-accent transition-all duration-300 hover:opacity-100 focus:opacity-100 focus:outline-none',
            'rounded-xl border border-zinc-400/20 shadow-lg backdrop-blur-lg dark:border-zinc-500/30 dark:bg-zinc-800/80 dark:text-zinc-200',
            'bg-slate-50/80 shadow-lg dark:bg-neutral-900/80',

            className,
          )}
          {...rest}
        >
          {children}
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export const FABContainer = (props: {
  children: JSX.Element | JSX.Element[]
}) => {
  const [fabConfig, setFabConfig] = useState<FABConfig[]>([])
  useEffect(() => {
    fab.register(setFabConfig)
    return () => {
      fab.destroy()
    }
  }, [])

  const [serverSide, setServerSide] = useState(true)

  useEffect(() => {
    setServerSide(false)
  }, [])

  if (serverSide) return null

  return (
    <div
      data-testid="fab-container"
      className={clsxm(
        'font-lg fixed bottom-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[9] flex flex-col',
      )}
    >
      {fabConfig.map((config) => {
        const { id, onClick, icon } = config
        return (
          <FABBase id={id} onClick={onClick} key={id}>
            {icon}
          </FABBase>
        )
      })}
      {props.children}
    </div>
  )
}