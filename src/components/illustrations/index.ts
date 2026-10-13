import type { ComponentType } from 'react'
import ArecaPalm from './ArecaPalm'
import Calathea from './Calathea'
import Dracaena from './Dracaena'
import Ivy from './Ivy'
import type { IllustrationProps } from './kit'
import Monstera from './Monstera'
import Peperomia from './Peperomia'
import Philodendron from './Philodendron'
import Pothos from './Pothos'
import RubberTree from './RubberTree'
import Sansevieria from './Sansevieria'
import Spathiphyllum from './Spathiphyllum'
import Stucky from './Stucky'
import Succulent from './Succulent'
import TablePalm from './TablePalm'
import ZZPlant from './ZZPlant'

export const illustrations: Record<string, ComponentType<IllustrationProps>> = {
  monstera: Monstera,
  stucky: Stucky,
  sansevieria: Sansevieria,
  pothos: Pothos,
  'rubber-tree': RubberTree,
  'zz-plant': ZZPlant,
  spathiphyllum: Spathiphyllum,
  'table-palm': TablePalm,
  'areca-palm': ArecaPalm,
  dracaena: Dracaena,
  peperomia: Peperomia,
  ivy: Ivy,
  philodendron: Philodendron,
  calathea: Calathea,
  succulent: Succulent,
}
