export interface BlogBlock {
  title: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  featuredImage: string;
  excerpt: string;
  content: string;
  id: string;
}

interface BlogListType {
  content: BlogBlock[];
}

export const blogList: BlogListType = {
  content: [
    {
      title: 'Benin community joining the Network',
      category: 'network',
      tags: ['network', 'bitcoin'],
      author: 'Rogzy',
      createdAt: new Date(),
      featuredImage:
        'https://planb.network/cdn/2c7f5c6d/resources/conference/planb-forum-lugano-2024/assets/thumbnail.webp',
      excerpt:
        'Short description....Destiné aux joueurs avertis et aux compétiteurs dans l’âme, du 28/03 au 28/04 cet event est là pour vous mettre au défi; Short description....Destiné aux joueurs avertis et aux compétiteurs dans l’âme, du 28/03 au 28/04 cet event est là pour vous mettre au défi',
      content:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      id: '1',
    },
    {
      title: 'Benin community joining the Network 2',
      category: 'network',
      tags: ['network', 'bitcoin'],
      author: 'Rogzy',
      createdAt: new Date(),
      featuredImage:
        'https://planb.network/cdn/2c7f5c6d/resources/conference/planb-forum-lugano-2024/assets/thumbnail.webp',
      excerpt:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      content:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      id: '2',
    },
    {
      title: 'Benin community joining the Network 3',
      category: 'course',
      tags: ['network', 'bitcoin'],
      author: 'Rogzy',
      createdAt: new Date(),
      featuredImage:
        'https://planb.network/cdn/2c7f5c6d/resources/conference/planb-forum-lugano-2024/assets/thumbnail.webp',
      excerpt:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      content:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      id: '3',
    },
    {
      title: 'Benin community joining the Network 4',
      category: 'network',
      tags: ['network', 'bitcoin'],
      author: 'Rogzy',
      createdAt: new Date(),
      featuredImage:
        'https://planb.network/cdn/2c7f5c6d/resources/conference/planb-forum-lugano-2024/assets/thumbnail.webp',
      excerpt:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      content:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      id: '4',
    },
    {
      title: 'Benin community joining the Network 5',
      category: 'patch',
      tags: ['network', 'bitcoin'],
      author: 'Rogzy',
      createdAt: new Date(),
      featuredImage:
        'https://planb.network/cdn/2c7f5c6d/resources/conference/planb-forum-lugano-2024/assets/thumbnail.webp',
      excerpt:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      content:
        'Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries Bitcoin is now a topic to be taught at school in El Salvador and in the future in other countries',
      id: '5',
    },
  ],
};
