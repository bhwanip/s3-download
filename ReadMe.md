### Description  

1. This is a solution to download files from a S3 bucket and preserve there folder structures.  
2. It also generates a report of the downloaded files, and uses AWS KMS **Envelope Encryption** to generate a data key for encryption of the report.  
3. The encrypted key is stored along with the report.  
4. The encrypted file can also be decrypted using the `decrypt` function exposed by the package.


#### downloadS3Data({ rootDir })
* The `rootDir` defaults to your current working directory. 
* It will create a folder `downloads_<timeInMills>`   
* This function will download the files from S# bucket and generate a `report.csv` file encrypted with a your KMS data key.  
* The key is stored as `report.csv.key`
* The return type of this function is 
```
{ 
    downloadFolder:<Name of the downloads folder> 
    rootDir: <The root dir you used>
    }
```

#### decrypt({ rootDir, downloadFolder })
* The `rootDir` is the dir which has your downloads folder.  
* The `downloadFolder` is the name of your download folder.  
* This function will generate a `report_decrypted.csv` file with plain text contents.  

  




  
