/* @flow */

export type Good = $Keys<typeof goods>

export type FactoryType = $Keys<typeof organizedBuildings.factories.col1> |
  $Keys<typeof organizedBuildings.factories.col2> |
  $Keys<typeof organizedBuildings.factories.col3>

export type VioletType = $Keys<typeof organizedBuildings.violet.col1> |
  $Keys<typeof organizedBuildings.violet.col2> |
  $Keys<typeof organizedBuildings.violet.col3> |
  $Keys<typeof organizedBuildings.violet.col4>

export type BuildingType = FactoryType | VioletType

export type BuildingT = {
  type: BuildingType,
  size: number,
  cost: number,
  col: number,
  spaces: number,
  bonus: string,
  group: 'factories' | 'violet',
}

export type Role = $Keys<typeof exports.roles>

exports.totalVictoryPoints = 32 + 18 * 5
exports.totalDubloons = 46 + 8 * 5

const goods = exports.goods = {
  coffee: {
    value: 4,
    count: 9,
    plantations: 8,
  },
  tobacco: {
    value: 3,
    count: 9,
    plantations: 9,
  },
  corn: {
    value: 0,
    count: 10,
    plantations: 10,
  },
  sugar: {
    value: 2,
    count: 11,
    plantations: 11,
  },
  indigo: {
    value: 1,
    count: 11,
    plantations: 12,
  },
}

exports.roles = {
  settler: {
    description: 'Settle stuff',
  },
  mayor: {
    description: 'Welcome newcomers',
  },
  builder: {
    description: 'Build buildings',
  },
  craftsman: {
    description: 'Harvest!',
  },
  trader: {
    description: 'Trade goods for sweet moolah',
  },
  captain: {
    description: 'Put stuff on ships',
  },
}

const organizedBuildings = {
  factories: {
    col1: {
      smallIndigo: {
        cost: 1,
      },
      smallSugar: {
        cost: 2,
      },
    },

    col2: {
      indigo: {
        spaces: 3,
        cost: 3,
      },
      sugar: {
        spaces: 3,
        cost: 4,
      },
    },

    col3: {
      tobacco: {
        spaces: 3,
        cost: 5,
      },
      coffee: {
        spaces: 2,
        cost: 6,
      },
    },
  },

  violet: {
    col1: {
      smallMarket: {
        bonus: '+1 dubloon w/ sale',
        cost: 1,
      },
      hacienda: {
        bonus: '+1 plantation from supply',
        cost: 2,
      },
      constructionHut: {
        bonus: 'quarry instead of plantation',
        cost: 2,
      },
      smallWarehouse: {
        bonus: 'store 1 kind of good',
        cost: 3,
      },
    },

    col2: {
      hospice: {
        cost: 4,
        bonus: '+1 colonist for settling',
      },
      office: {
        cost: 5,
        bonus: 'sell duplicate goods',
      },
      largeMarket: {
        cost: 5,
        bonus: '+2 dubloons w/ sale',
      },
      largeWarehouse: {
        cost: 6,
        bonus: 'store 2 kinds of good',
      },
    },

    col3: {
      factory: {
        bonus: '+0/1/2/3/5 doubloons w/ production',
        cost: 7,
      },
      university: {
        cost: 8,
        bonus: '+1 colonist for building',
      },
      harbor: {
        cost: 8,
        bonus: '+1 VP for shipping',
      },
      wharf: {
        cost: 9,
        bonus: 'your own ship',
      },
    },

    col4: {
      guildHall: {
        cost: 10,
        bonus: '2 VP for each large building, 1 VP for each small building',
      },
      residence: {
        cost: 10,
        bonus: '4 VP for <= 9 plantations. 5 for 10, 6 for 11, 7 for 12',
      },
      fortress: {
        cost: 10,
        bonus: '1 VP for every 5 colonists',
      },
      customsHouse: {
        cost: 10,
        bonus: '1 VP for every 4 VP chips',
      },

      cityHall: {
        cost: 10,
        bonus: '1 VP for each violet building',
      },

    },
  },
}

type PartBuilding = {
  cost: number,
  bonus?: string,
  spaces?: number,
}

const m: any = {}
const buildings: {[key: BuildingType]: BuildingT} = exports.buildings = m
const addBuildings = (ones: any, group, size, col) => {
  Object.keys(ones).forEach((key: BuildingType) => {
    buildings[key] = {
      type: key,
      ...ones[key],
      spaces: ones[key].spaces || 1,
      group,
      size,
      col,
    }
  })
}
addBuildings(organizedBuildings.factories.col1, 'factories', 1, 1)
addBuildings(organizedBuildings.factories.col2, 'factories', 1, 2)
addBuildings(organizedBuildings.factories.col3, 'factories', 1, 3)
addBuildings(organizedBuildings.violet.col1, 'violet', 1, 1)
addBuildings(organizedBuildings.violet.col2, 'violet', 1, 2)
addBuildings(organizedBuildings.violet.col3, 'violet', 1, 3)
addBuildings(organizedBuildings.violet.col4, 'violet', 2, 4)
