export interface IBrandImage {
  url: string;
  public_id: string;
}

export interface IBrand {
  img: IBrandImage;
  name: string;
  isDeleted?: boolean;
}
