export interface Character {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  anime: Array<{
    role: string;
    anime: {
      title: string;
    };
  }>;
}
