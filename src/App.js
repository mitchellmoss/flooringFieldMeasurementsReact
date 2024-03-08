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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
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

const useCurrentDateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDateTime = now.toLocaleString();
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime(); // Initial update

    const interval = setInterval(updateDateTime, 1000); // Update every second

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);

  return currentDateTime;
};

const FlooringInstallationNotes = () => {
  const classes = useStyles();
  const [jobAddress, setJobAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [subSubArea, setSubSubArea] = useState('');
  const [dimensions, setDimensions] = useState([
    { lengthFeet: '', lengthInches: '', widthFeet: '', widthInches: '' },
  ]);
  const [totalSqFeet, setTotalSqFeet] = useState(0);
  const [notes, setNotes] = useState('');
  const [flooringList, setFlooringList] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const currentDateTime = useCurrentDateTime();
  useEffect(() => {
    setDateTime(currentDateTime);
  }, [currentDateTime]);

  useEffect(() => {
    const savedJobAddress = localStorage.getItem('jobAddress');
    const savedDateTime = localStorage.getItem('dateTime');
    const savedFlooringList = JSON.parse(localStorage.getItem('flooringList'));

    if (savedJobAddress) setJobAddress(savedJobAddress);
    if (savedDateTime) setDateTime(savedDateTime);
    if (savedFlooringList) setFlooringList(savedFlooringList);
  }, []);

  const handleEdit = (index) => {
    const item = flooringList[index];
    setEditIndex(index);
    setJobAddress(item.jobAddress);
    setDateTime(item.dateTime);
    setArea(item.area);
    setSubArea(item.subArea);
    setSubSubArea(item.subSubArea);
    setDimensions(item.dimensions);
    setTotalSqFeet(item.totalSqFeet);
    setNotes(item.notes);
  };

  const addUpdateList = () => {
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

    if (editIndex === -1) {
      // Add new item
      const updatedList = [...flooringList, newItem];
      setFlooringList(updatedList);
      localStorage.setItem('flooringList', JSON.stringify(updatedList));
    } else {
      // Update existing item
      const updatedList = [...flooringList];
      updatedList[editIndex] = newItem;
      setFlooringList(updatedList);
      localStorage.setItem('flooringList', JSON.stringify(updatedList));
      setEditIndex(-1);
    }

    setArea('');
    setSubArea('');
    setSubSubArea('');
    setDimensions([{ length: '', width: '' }]);
    setTotalSqFeet(0);
    setNotes('');
  };

  const handleDelete = (index) => {
    const updatedList = [...flooringList];
    updatedList.splice(index, 1);
    setFlooringList(updatedList);
    localStorage.setItem('flooringList', JSON.stringify(updatedList));
  };

  const handleDimensionChange = (index, field, value) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions[index][field] = value;
    setDimensions(updatedDimensions);
  };

  const addDimension = () => {
    setDimensions([
      ...dimensions,
      { lengthFeet: '', lengthInches: '', widthFeet: '', widthInches: '' },
    ]);
  };

  const removeDimension = (index) => {
    const updatedDimensions = [...dimensions];
    updatedDimensions.splice(index, 1);
    setDimensions(updatedDimensions);
  };

  const calculateTotalSF = () => {
    const totalSF = dimensions.reduce((total, dimension) => {
      const length = parseFloat(dimension.lengthFeet) + parseFloat(dimension.lengthInches) / 12;
      const width = parseFloat(dimension.widthFeet) + parseFloat(dimension.widthInches) / 12;
      return total + length * width;
    }, 0);
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
      item.dimensions
        .map((dim) => `${dim.lengthFeet}' ${dim.lengthInches}" x ${dim.widthFeet}' ${dim.widthInches}"`)
        .join(', '),
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
      dimensions: dimensions.map((dimension) => ({
        lengthFeet: dimension.lengthFeet,
        lengthInches: dimension.lengthInches,
        widthFeet: dimension.widthFeet,
        widthInches: dimension.widthInches,
      })),
      totalSqFeet,
      notes,
    };
  
    const updatedList = [...flooringList, newItem];
    setFlooringList(updatedList);
    localStorage.setItem('flooringList', JSON.stringify(updatedList));
  
    setArea('');
    setSubArea('');
    setSubSubArea('');
    setDimensions([{ lengthFeet: '', lengthInches: '', widthFeet: '', widthInches: '' }]);
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
              label="Length (ft)"
              value={dimension.lengthFeet}
              onChange={(e) => handleDimensionChange(index, 'lengthFeet', e.target.value)}
            />
            <TextField
              label="Length (in)"
              value={dimension.lengthInches}
              onChange={(e) => handleDimensionChange(index, 'lengthInches', e.target.value)}
            />
            
            <TextField
              label="Width (ft)"
              value={dimension.widthFeet}
              onChange={(e) => handleDimensionChange(index, 'widthFeet', e.target.value)}
            />
            <TextField
              label="Width (in)"
              value={dimension.widthInches}
              onChange={(e) => handleDimensionChange(index, 'widthInches', e.target.value)}
            />
            <IconButton onClick={() => removeDimension(index)}>
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addDimension}>
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
          <Button variant="contained" color="primary" onClick={addUpdateList}>
            {editIndex === -1 ? 'Add to List' : 'Update Item'}
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
        {item.dimensions.map((dimension) =>
          `${dimension.lengthFeet}' ${dimension.lengthInches}" x ${dimension.widthFeet}' ${dimension.widthInches}"`
        ).join(', ')}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        <strong>Total Square Feet (SF):</strong> {item.totalSqFeet}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        <strong>Notes:</strong> {item.notes}
      </Typography>
      <div>
        <IconButton onClick={() => handleEdit(index)}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(index)}>
          <DeleteIcon />
        </IconButton>
      </div>
    </CardContent>
  </Card>
))}
    </div>
  );
};

export default FlooringInstallationNotes;