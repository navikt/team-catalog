package no.nav.data.common.export;

import no.nav.data.common.exceptions.TechnicalException;
import org.docx4j.openpackaging.packages.SpreadsheetMLPackage;
import org.docx4j.openpackaging.parts.PartName;
import org.docx4j.openpackaging.parts.SpreadsheetML.WorksheetPart;
import org.xlsx4j.jaxb.Context;
import org.xlsx4j.sml.CTRst;
import org.xlsx4j.sml.CTXstringWhitespace;
import org.xlsx4j.sml.ObjectFactory;
import org.xlsx4j.sml.STCellType;

import java.io.ByteArrayOutputStream;

public class ExcelBuilder {

    public static final String SPREADSHEETML_SHEET_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private static final ObjectFactory fac = Context.getsmlObjectFactory();

    private final SpreadsheetMLPackage pack;
    private final WorksheetPart sheet;

    long rowN = 0;

    public ExcelBuilder(String sheetName) {
        try {
            pack = SpreadsheetMLPackage.createPackage();
            sheet = pack.createWorksheetPart(new PartName("/xl/worksheets/sheet1.xml"), sheetName, 1);
        } catch (Exception e) {
            throw new TechnicalException("excel error", e);
        }
    }

    public ExcelRow addRow() {
        return new ExcelRow();
    }

    public class ExcelRow {

        org.xlsx4j.sml.Row row = fac.createRow();
        char col = 'A';

        public ExcelRow() {
            row.setR(++rowN);
            sheet.getJaxbElement().getSheetData().getRow().add(row);
        }

        public ExcelRow addCell(String content) {
            var cell = fac.createCell();

            CTXstringWhitespace t = fac.createCTXstringWhitespace();
            t.setValue(content);
            CTRst ctRst = fac.createCTRst();
            ctRst.setT(t);

            cell.setIs(ctRst);
            cell.setR("%s%s".formatted(col++, rowN));
            cell.setT(STCellType.INLINE_STR);
            row.getC().add(cell);
            return this;
        }

        public ExcelRow addCell(Number number) {
            var cell = fac.createCell();

            cell.setV(number != null ? String.valueOf(number) : "");
            cell.setR("%s%s".formatted(col++, rowN));
            cell.setT(STCellType.N);
            row.getC().add(cell);
            return this;
        }

    }

    public byte[] build() {
        try {
            var outStream = new ByteArrayOutputStream();
            pack.save(outStream);
            return outStream.toByteArray();
        } catch (Exception e) {
            throw new TechnicalException("excel error", e);
        }
    }
}
