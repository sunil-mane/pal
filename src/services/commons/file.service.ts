/**
 * Created by sandip on 2/8/17.
 */
import {Injectable} from '@angular/core';
import {Http, Response, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/map';
import {ServiceErrorInfo} from '../../dto/common.dto';


declare let cordova: any;

@Injectable()
export class FileService {

    public FILE_NOT_SUPPORT_ERROR_CODE = 10001;

    constructor(private $http: Http) {

    }

    checkFile(fileName: string, isTemp: boolean, shouldCreate: boolean, successCallback: any, errorCallback: any): void {
        if (typeof cordova !== 'undefined') {
            const uri: string = (isTemp == true) ? cordova.file.cacheDirectory : cordova.file.dataDirectory;
            (<any>window).resolveLocalFileSystemURL(uri, (dirEntry: any) => {
                dirEntry.getFile(fileName, {create: shouldCreate}, (fileEntry: any) => {
                    // console.log("fileEntry isFile: " + fileEntry.isFile);
                    if (successCallback) {
                        successCallback(fileEntry);
                    }
                }, (error: any) => {
                    console.log("getFile error:\n" + JSON.stringify(error));
                    if (errorCallback) {
                        errorCallback(error);
                    }
                });
            }, (error: any) => {
                console.log("requestFileSystem error:\n" + JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            });
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                error.code = this.FILE_NOT_SUPPORT_ERROR_CODE;
                errorCallback(error);
            }
        }
    }

    isFileExists(fileName: string, isTemp: boolean, successCallback: any, errorCallback: any): void {
        // console.log("isFileExists: " + fileName);
        this.checkFile(fileName, isTemp,false, (fileEntry: any) => {
            // console.log("isFileExists fileEntry:\n" + fileEntry.toURL());
            if (fileEntry.isFile == true) {
                // console.log("fileEntry isFileExists: " + fileEntry.isFile);
                if (successCallback) {
                    successCallback();
                }
            } else {
                if (errorCallback) {
                    errorCallback(null);
                }
            }
        }, (error: any) => {
            if (errorCallback) {
                errorCallback(error);
            }
        });
    }

    dataURL(fileName: string, isTemp: boolean): Promise<string> {
        return new Promise(resolve => {
            this.checkFile(fileName, isTemp, false, (fileEntry: any) => {
                // console.log("dataURL fileEntry:\n" + fileEntry.toURL());
                fileEntry.file((file: any) => {
                    let reader = new FileReader();
                    reader.onloadend = function() {
                        // console.log("Successful file read...");
                        resolve(this.result);
                    };
                    reader.readAsDataURL(file);
                }, (error: any) => {
                    console.log("fileEntry.file error:\n" + JSON.stringify(error));
                    resolve(null);
                });
            }, (error: any) => {
                console.log("dataURL error:\n" + JSON.stringify(error));
                resolve(null);
            });
        });
    }

    writeFile(fileContent: any, fileName: string, isTemp: boolean, callback: any): void {
        this.checkFile(fileName, isTemp, true, (fileEntry: any) => {
            if (fileContent) {
                // console.log("writeFile fileEntry:\n" + fileEntry.toURL());
                fileEntry.createWriter((fileWriter: any) => {
                    fileWriter.onwriteend = () => {
                        // console.log("Successful file write...");
                        if (callback) {
                            callback(true);
                        }
                    };
                    fileWriter.onerror = (e) => {
                        console.log("Failed file write:\n" + e.toString());
                        if (callback) {
                            callback(false);
                        }
                    };
                    fileWriter.write(fileContent);
                });
            } else {
                if (callback) {
                    callback(false);
                }
            }
        }, (error: any) => {
            if (callback) {
                callback(false);
            }
        });
    }

    removeFile(fileName: string, isTemp: boolean, callback: any): void {
        this.checkFile(fileName, isTemp,false, (fileEntry: any) => {
            // console.log("removeFile fileEntry:\n" + fileEntry.toURL());
            fileEntry.remove((entry: any) => {
                // console.log("Removal succeeded");
                if (callback) {
                    callback(true);
                }
            }, (error: any) => {
                console.log('Error removing file:\n' + JSON.stringify(error));
                if (callback) {
                    callback(false);
                }
            });
        }, (error: any) => {
            if (callback) {
                callback(false);
            }
        });
    }

    downloadFile(sourceURL: string, fileName: string, isTemp: boolean, successCallback: any, errorCallback: any): void {
        if (typeof cordova !== 'undefined') {
            // console.log("downloadFile:\n" + sourceURL);
            this.$http.get(sourceURL, {responseType: ResponseContentType.Blob})
                .subscribe((result: Response) => {
                    let blob = new Blob([result.blob()], {type: 'image/png'});
                    this.writeFile(blob, fileName, isTemp,
                        (result: boolean) => {
                            if (result == true) {
                                this.dataURL(fileName, false)
                                    .then((result: string) => {
                                        if (result) {
                                            successCallback(result);
                                        } else {
                                            if (errorCallback) {
                                                errorCallback(null);
                                            }
                                        }
                                    });
                            } else if (errorCallback) {
                                errorCallback(null);
                            }
                        });
                }, (error: Response) => {
                    let errorInfo: ServiceErrorInfo = new ServiceErrorInfo();
                    if (error) {
                        errorInfo = error.json();
                        errorInfo.code = error.status;
                    }
                    if (errorCallback) {
                        errorCallback(errorInfo);
                    }
                });
        }
        else {
            if (errorCallback) {
                let error = new ServiceErrorInfo();
                error.message = 'Platform does not support';
                error.code = this.FILE_NOT_SUPPORT_ERROR_CODE;
                errorCallback(error);
            }
        }
    }

}
