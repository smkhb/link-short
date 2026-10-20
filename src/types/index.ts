/**
 * The type for the query parameters of the getMyLinks route
 */
export type RequestQuery = {
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filter?: string;
  offset?: number;
  limit?: number;
};

/**
 * The type of the properties for generating next and previous links
 */
export type GenLinkProps = {
  userId: string;
  baseUrl: string;
  search?: string;
  sortby?: string;
  page: number; // The current page number in the paginated results
  pageSize: number; // The number of items per page
};
