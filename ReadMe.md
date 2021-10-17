### Description  

* This is a solution to download files from a S3 bucket and preserve there folder structures.  
* It also generates a report of the downloaded files, and uses AWS KMS **Envelope Encryption** i.e. uses a data key for encryption of the report.  
* The encrypted key is stored along with the report.  
* The encrypted file can also be decrypted using the `decrypt` function exposed by the package.

#### Performance Considerations
* The solution uses Nodejs Streams API and events, to read and write S3 files, this ensures low memory footprint and high performance.
* The solution uses Nodejs Async programming paradigm.

### Prerequisites
* Ensure your have your AWS credentials with access to S3 and KMS set up at `~/.aws/credentials`.
* Set up env variables `AWS_REGION` and your AWS CMK key id as `AWS_KMS_KEY_ID`
* You can also set these in `src/config/index.ts`
 
 ## Functions/API
#### downloadS3Data({ rootDir })
* The `rootDir` defaults to your current working directory. 
* It will create a folder `downloads_<timeInMills>`   
* This function will download the files from S3 bucket and generate a `report.csv` file encrypted with a your KMS data key.  
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

### Build
```
npm install
npm run build
```

### Linting/Prettier
```
npm run lint
npm run lint:fix
npm run format:code
```

### Tests
Run integration test, 
* It will upload actual data from `test/integration/testData` to S3.
* Download s3 data, generate and encrypt report file.
* Decrypt and then verify contents of report file.
```
npm run intg:test
```  

Run all tests
```
npm run test
```

### Code Coverage
The code coverage is 100%, the coverage report can be found at `coverage/lcov-report/index.html`






  




  
