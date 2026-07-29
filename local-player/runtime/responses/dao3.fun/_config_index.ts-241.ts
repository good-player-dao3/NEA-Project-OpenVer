import createraDevelopmentConfig from './createra/development.json'
import createraPreprodConfig from './createra/preprod.json'
import createraProductionConfig from './createra/production.json'

import box3CommonConfig from './box3/common.json'
import box3DevelopmentConfig from './box3/development.json'
import box3PreprodConfig from './box3/preprod.json'
import box3ProductionConfig from './box3/production.json'
import box3StagingConfig from './box3/staging.json'

const APP_EDITION = process.env.NEXT_PUBLIC_APP_EDITION as 'box3' | 'createra'

if (!['box3', 'createra'].includes(APP_EDITION)) {
  throw new Error(`Wrong app edition: ${APP_EDITION}`)
}

// 此分支必为 Box3 版本
export const commonConfig = box3CommonConfig

export const developmentConfig = {
  createra: createraDevelopmentConfig,
  box3: box3DevelopmentConfig,
}[APP_EDITION]

export const stagingConfig = box3StagingConfig

export const preprodConfig = {
  createra: createraPreprodConfig,
  box3: box3PreprodConfig,
}[APP_EDITION]

export const productionConfig = {
  createra: createraProductionConfig,
  box3: box3ProductionConfig,
}[APP_EDITION]

let localConfig = {}

try {
  // eslint-disable-next-line
  localConfig = require(`./${APP_EDITION}/local.json`)
} catch (error) {
  // pass as no local config
}

export {
  localConfig,
}
