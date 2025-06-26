export interface Fasilitas {
    id: string
    name: string
    description: string
    rating: number
    totalRatings: number
    image: string
    tags: string[]
    category: string
  }
  
  export const fasilitasData: Fasilitas[] = [
    {
      id: '1',
      name: 'Fasilitas 1',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 10,
      image: '/api/placeholder/300/200',
      tags: ['Tag 1', 'Tag 2', 'Tag 3'],
      category: 'Kategori A'
    },
    {
      id: '2',
      name: 'Fasilitas 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 15,
      image: '/api/placeholder/300/200',
      tags: ['Tag 1', 'Tag 2'],
      category: 'Kategori B'
    },
    {
      id: '3',
      name: 'Fasilitas 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 8,
      image: '/api/placeholder/300/200',
      tags: ['Tag 2', 'Tag 3'],
      category: 'Kategori A'
    },
    {
      id: '4',
      name: 'Fasilitas 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 12,
      image: '/api/placeholder/300/200',
      tags: ['Tag 1'],
      category: 'Kategori C'
    },
    {
      id: '5',
      name: 'Fasilitas 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 20,
      image: '/api/placeholder/300/200',
      tags: ['Tag 2', 'Tag 3'],
      category: 'Kategori B'
    },
    {
      id: '6',
      name: 'Fasilitas 6',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      rating: 5.0,
      totalRatings: 18,
      image: '/api/placeholder/300/200',
      tags: ['Tag 1', 'Tag 3'],
      category: 'Kategori A'
    }
  ]
  
  export const getRelatedFasilitas = (currentId: string, limit: number = 3) => {
    return fasilitasData.filter(f => f.id !== currentId).slice(0, limit)
  }