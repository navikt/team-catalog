import { AxiosResponse } from "axios";
import { UserInfo } from "../constants";
import { getUserInfo } from "../api";
import { ampli } from './Amplitude'

export enum Group {
  TEAM_READ = "TEAM_READ",
  TEAM_WRITE = "TEAM_WRITE",
  TEAM_ADMIN = "TEAM_ADMIN"
}

class UserService {
  loaded = false;
  userInfo: UserInfo = {loggedIn: false, groups: []};
  error?: string;
  promise: Promise<any>;

  constructor() {
    this.promise = this.fetchData();
  }

  private fetchData = async () => {
    return getUserInfo()
    .then(this.handleGetResponse)
    .catch(err => {
      this.error = err.message;
      this.loaded = true;
    });
  };

  handleGetResponse = (response: AxiosResponse<UserInfo>) => {
    if (typeof response.data === "object" && response.data !== null) {
      this.userInfo = response.data;
      ampli.setUserId(this.userInfo.ident || null)
    } else {
      this.error = response.data;
    }
    this.loaded = true;
  };

  isLoggedIn(): boolean {
    return this.userInfo.loggedIn;
  }

  public getIdent(): string {
    return this.userInfo.ident ?? "";
  }

  public getEmail(): string {
    return this.userInfo.email ?? "";
  }

  public getName(): string {
    return this.userInfo.name ?? "";
  }

  public getGivenName(): string {
    return this.userInfo.givenName ?? "";
  }

  public getFamilyName(): string {
    return this.userInfo.familyName ?? "";
  }

  public getGroups(): string[] {
    return this.userInfo.groups;
  }

  // public getGroupsHumanReadable(): string[] {
  //   return this.userInfo.groups.map(group => (intl as any)[group] || group)
  // }

  public hasGroup(group: string): boolean {
    return this.getGroups().indexOf(group) >= 0;
  }

  public canRead(): boolean {
    return this.hasGroup(Group.TEAM_READ);
  }

  public canWrite(): boolean {
    return this.hasGroup(Group.TEAM_WRITE);
  }

  public isAdmin(): boolean {
    return this.hasGroup(Group.TEAM_ADMIN);
  }

  async wait() {
    await this.promise;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

export const user = new UserService();
