import { default as stringify } from "csv-stringify";
import * as fs from "fs-extra";

export const reporter = stringify({
  delimiter: ",",
  quoted: true,
});

export function initReporter({
  reportPath,
}: {
  reportPath: string;
}) {
  reporter.on("readable", async () => {
    let row = "";
    while ((row = reporter.read())) {
      await fs.appendFile(
        reportPath,
        row,
        "utf8"
      );
    }
  });
}
