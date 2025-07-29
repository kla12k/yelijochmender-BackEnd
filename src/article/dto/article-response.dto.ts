// Data Transfer Object for article responses
export class ArticleResponseDto {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage: string;
  authorId: string;
  categoryId: string;
  tags: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isActive: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
