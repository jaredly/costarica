/* @flow */

exports.goods = {
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

exports.totalVictoryPoints = 32 + 18 * 5
exports.totalDubloons = 46 + 8 * 5

exports.buildings = {
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
        bonus: '+1 population from supply',
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

