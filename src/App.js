import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
} from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  dimensionContainer: {
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const FlooringInstallationNotes = () => {
  const classes = useStyles();
  const [jobAddress, setJobAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [subSubArea, setSubSubArea] = useState('');
  const [dimensions, setDimensions] = useState([{ length: '', width: '' }]);
  const [totalSqFeet, setTotalSqFeet] = useState(0);
  const [notes, setNotes] = useState('');
  const [flooringList, setFlooringList] = useState([]);

  useEffect(() => {
    const savedJobAddress = localStorage.getItem('jobAddress');
    const savedDateTime = localStorage.getItem('dateTime');
    const savedFlooringList = JSON.parse(localStorage.getItem('flooringList'));

    if (savedJobAddress) setJobAddress(savedJobAddress);
    if (savedDateTime) setDateTime(savedDateTime);
    if (savedFlooringList) setFlooringList(savedFlooringList);
  }, []);

  const handleDimensionChange = (index, field, value) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions[index][field] = value;
    setDimensions(updatedDimensions);
  };

  const addDimension = () => {
    setDimensions([...dimensions, { length: '', width: '' }]);
  };

  const removeDimension = (index) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions.splice(index, 1);
    setDimensions(updatedDimensions);
  };

  const calculateTotalSF = () => {
    const totalSF = dimensions.reduce(
      (total, dimension) => total + dimension.length * dimension.width,
      0
    );
    setTotalSqFeet(totalSF.toFixed(2));
  };


  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Flooring Installation Notes', 14, 22);

    // Add job address
    doc.setFontSize(12);
    doc.text(`Job Address / Name: ${jobAddress}`, 14, 32);

    // Add date/time
    doc.text(`Date / Time: ${dateTime}`, 14, 38);

    // Add table with flooring installation list
    const tableData = flooringList.map((item) => [
      item.area,
      item.subArea,
      item.subSubArea,
      item.dimensions.map((dim) => `${dim.length} x ${dim.width}`).join(', '),
      item.totalSqFeet,
      item.notes,
    ]);

    doc.autoTable({
      startY: 44,
      head: [['Area / Floor', 'Sub Area', 'Sub-Sub Area', 'Dimensions', 'Total SF', 'Notes']],
      body: tableData,
    });

    // Save the PDF
    doc.save('flooring_installation_notes.pdf');
  };

  const addToList = () => {
    const newItem = {
      jobAddress,
      dateTime,
      area,
      subArea,
      subSubArea,
      dimensions,
      totalSqFeet,
      notes,
    };

    const updatedList = [...flooringList, newItem];
    setFlooringList(updatedList);
    localStorage.setItem('flooringList', JSON.stringify(updatedList));

    setArea('');
    setSubArea('');
    setSubSubArea('');
    setDimensions([{ length: '', width: '' }]);
    setTotalSqFeet(0);
    setNotes('');
  };

  

  const clearStorage = () => {
    localStorage.removeItem('jobAddress');
    localStorage.removeItem('dateTime');
    localStorage.removeItem('flooringList');
    setJobAddress('');
    setDateTime('');
    setFlooringList([]);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Flooring Installation Notes
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table className={classes.table}>
              <TableBody>
                <TableRow>
                  <TableCell>Job Address / Name</TableCell>
                  <TableCell>
                    <TextField
                      value={jobAddress}
                      onChange={(e) => {
                        setJobAddress(e.target.value);
                        localStorage.setItem('jobAddress', e.target.value);
                      }}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Date / Time</TableCell>
                  <TableCell>
                    <TextField
                      value={dateTime}
                      onChange={(e) => {
                        setDateTime(e.target.value);
                        localStorage.setItem('dateTime', e.target.value);
                      }}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Area / Floor</TableCell>
                  <TableCell>
                    <TextField
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sub Area</TableCell>
                  <TableCell>
                    <TextField
                      value={subArea}
                      onChange={(e) => setSubArea(e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sub-Sub Area</TableCell>
                  <TableCell>
                    <TextField
                      value={subSubArea}
                      onChange={(e) => setSubSubArea(e.target.value)}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Dimensions (L x W)</TableCell>
                  <TableCell>
                    {dimensions.map((dimension, index) => (
                      <div key={index} className={classes.dimensionContainer}>
                        <TextField
                          label="Length"
                          value={dimension.length}
                          onChange={(e) =>
                            handleDimensionChange(index, 'length', e.target.value)
                          }
                        />
                        <TextField
                          label="Width"
                          value={dimension.width}
                          onChange={(e) =>
                            handleDimensionChange(index, 'width', e.target.value)
                          }
                        />
                        <IconButton onClick={() => removeDimension(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addDimension}
                    >
                      Add Dimension
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Square Feet (SF)</TableCell>
                  <TableCell>
                    <TextField value={totalSqFeet} disabled fullWidth />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Notes</TableCell>
                  <TableCell>
                    <TextField
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <div className={classes.buttonContainer}>
            <Button variant="contained" color="primary" onClick={calculateTotalSF}>
              Calculate Total SF
            </Button>
            <Button variant="contained" color="primary" onClick={addToList}>
              Add to List
            </Button>
            <Button variant="contained" color="secondary" onClick={generatePDF}>
              Generate PDF
            </Button>
            <Button variant="contained" onClick={clearStorage}>
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Flooring Installation List
      </Typography>
      {flooringList.map((item, index) => (
        <Card key={index} className={classes.listItem}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Job Address / Name:</strong> {item.jobAddress}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date / Time:</strong> {item.dateTime}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Area / Floor:</strong> {item.area}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Sub Area:</strong> {item.subArea}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Sub-Sub Area:</strong> {item.subSubArea}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Dimensions (L x W):</strong>{' '}
              {item.dimensions
                .map((dimension) => `${dimension.length} x ${dimension.width}`)
                .join(', ')}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Total Square Feet (SF):</strong> {item.totalSqFeet}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Notes:</strong> {item.notes}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FlooringInstallationNotes;