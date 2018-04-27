export interface GlobalEnvironmentVariables {
    ServerBaseDir: string;
    Port: number;
    PageNotFound: string;
    ControllerDir: string;
    ViewDir: string;
    ModelDir: string;
    Controllers: Array<string>;
    WebDir: string;
    LogDir: string;
    MaxCacheSize: number;
    DBProvider: string;
    DBConnectionString: string;
    PackageData: Object;
    DefaultPages: Array<string>;
    AsyncOperationTimeout: number;
    PluginDir: string;
    Verbose: boolean;
    TLSOptions: TLSConfiguration;
    LogOptions: LogOption;
}
export interface TLSConfiguration {
    Port: number;
    Cert: string;
    Key: string;
    CA: string;
}
export interface LogOption {
    BufferSize: number;
    LogLimit: number;
}
