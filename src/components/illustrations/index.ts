import type { ComponentType } from 'react'
import Monstera from './Monstera'
import Pothos from './Pothos'
import Stucky from './Stucky'
import type { IllustrationProps } from './Pot'

export const illustrations: Record<string, ComponentType<IllustrationProps>> = {
  monstera: Monstera,
  stucky: Stucky,
  pothos: Pothos,
}
