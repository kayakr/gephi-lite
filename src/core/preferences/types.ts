import { RemoteFile } from "../graph/types";

export interface Preferences {
  recentRemoteFiles: RemoteFile[];
  locale: string;
}
