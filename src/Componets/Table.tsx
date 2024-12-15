import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Checkbox } from "primereact/checkbox";
import { PaginatorPageChangeEvent } from "primereact/paginator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import "./table.css"

// Defining structure of Artwork to maintain type safety
interface Artwork {
  id: number;
  title: string;
  artist_title: string;
  date_start: number | null;
  date_end: number | null;
}

interface ApiResponse {
  data: Artwork[];
  pagination: {
    current_page: number;
    total_pages: number;
  };
}

const ArtworkTable: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [activePage, setActivePage] = useState(1); 
  const [totalPageCount, setTotalPageCount] = useState(0); 
  const [selectedRows, setSelectedRows] = useState<{ [id: number]: boolean }>({});
  const [showOverlay, setShowOverlay] = useState(false);
  const [inputNum, setInputNum] = useState(""); 

  const rowsPerPage = 10; 
  const overlayRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchArtworks(activePage);
  }, [activePage]);

  const fetchArtworks = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const apiData: ApiResponse = await response.json();
      setData(apiData.data); 
      setTotalPageCount(apiData.pagination.total_pages); 
    } catch (err) {
      console.error("Error while fetching artwork data:", err);
    } finally {
      setIsLoading(false); // Stop showing loader
    }
  };

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setActivePage(event.page + 1);
  };

  const isRowSelected = (row: Artwork) => Boolean(selectedRows[row.id]);

  // Renders checkbox column for each row
  const renderCheckbox = (row: Artwork) => (
    <Checkbox
      checked={isRowSelected(row)}
      onChange={(e) => {
        const updatedSelections = { ...selectedRows };
        if (e.checked) {
          updatedSelections[row.id] = true;
        } else {
          delete updatedSelections[row.id];
        }
        setSelectedRows(updatedSelections);
      }}
    />
  );

  // Handles overlay form submission to select rows
  const handleOverlaySubmit = () => {
    const count = parseInt(inputNum, 10);
    if (isNaN(count) || count <= 0) {
      alert("Enter a valid number greater than zero.");
      return;
    }

    const selectCount = Math.min(count, data.length);
    const newSelection: { [id: number]: boolean } = {};
    for (let i = 0; i < selectCount; i++) {
      newSelection[data[i].id] = true;
    }
    setSelectedRows(newSelection);
    overlayRef.current?.hide();
    setShowOverlay(false);
  };

  const handleSelectionChange = (e: any) => {
    const updatedSelection: { [id: number]: boolean } = {};
    e.value.forEach((row: Artwork) => {
      updatedSelection[row.id] = true;
    });
    setSelectedRows(updatedSelection);
  };

  return (
    <div>
      <DataTable
        value={data}
        paginator
        rows={rowsPerPage}
        lazy
        first={(activePage - 1) * rowsPerPage}
        loading={isLoading}
        totalRecords={totalPageCount * rowsPerPage}
        onPage={handlePageChange}
        selection={data.filter(isRowSelected)}
        onSelectionChange={handleSelectionChange}
      >
        <Column selectionMode="multiple" body={renderCheckbox} />
        <Column field="id" header="ID" />
        <Column
          field="title"
          header={
            <span
              onClick={(e) => {
                overlayRef.current?.toggle(e);
                setShowOverlay(true);
              }}
            >
              Title <ExpandMoreIcon sx={{ marginLeft: "8px", cursor: "pointer" }} />
            </span>
          }
        />
        <Column field="artist" header="Artist" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <OverlayPanel
        ref={overlayRef}
        visible={showOverlay}
        onHide={() => setShowOverlay(false)}
        style={{ width: "300px" }}
      >
        <div>
          <label htmlFor="numRowsToSelect">Number of Rows to Select:</label>
          <input
            id="numRowsToSelect"
            type="number"
            value={inputNum}
            onChange={(e) => setInputNum(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "12px" }}
          />
          <Button
            label="Submit"
            className="p-button-success"
            onClick={handleOverlaySubmit}
          />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default ArtworkTable;
