/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package DAO;

/**
 *
 * @author Carlos Alberto
 */
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import util.Conexion;
import VO.Producto;
import VO.Tienda;

public class tiendaDAO {

    private Connection conexion;

    public tiendaDAO() {
        try {
            this.conexion = Conexion.getConnection();
        } catch (URISyntaxException ex) {
            Logger.getLogger(tiendaDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public boolean crearTienda(Tienda tienda) {
        boolean resultado = false;
        try {
            //1.Establecer la consulta
            String consulta = "INSERT INTO tienda VALUES(?,?,?,?,?)";
            //2. Crear el PreparedStament
            PreparedStatement statement
                    = this.conexion.prepareStatement(consulta);
            //-----------------------------------
            statement.setString(1, tienda.getId());
            statement.setString(2, tienda.getNombre());
            statement.setString(3, tienda.getDireccion());
            statement.setString(4, tienda.getTelefono());
            statement.setString(5, tienda.getUrl());

            //--------------------------------------
            //3. Hacer la ejecucion
            resultado = statement.execute();
            return true;

        } catch (SQLException ex) {
            ex.printStackTrace();
        }

        return resultado;
    }

    public ArrayList<Tienda> leerTienda() {
        //1.Consulta
        ArrayList<Tienda> respuesta = new ArrayList();

        String consulta = "SELECT * FROM tienda";
        try {
            //----------------------------
            //Statement
            Statement statement
                    = this.conexion.createStatement();
            //Ejecucion
            ResultSet resultado
                    = statement.executeQuery(consulta);
            //----------------------------
            //Recorrido sobre el resultado

            while (resultado.next()) {

                Tienda tienda = new Tienda();

                tienda.setId(resultado.getString(1));
                tienda.setNombre(resultado.getString(2));
                tienda.setDireccion(resultado.getString(3));
                tienda.setTelefono(resultado.getString(4));
                tienda.setUrl(resultado.getString(5));
                respuesta.add(tienda);
            }

        } catch (SQLException ex) {
            ex.printStackTrace();
        }

        return respuesta;
    }

    public Tienda leerTiendaPorID(String id) {
        //1.Consulta
        ArrayList<Tienda> respuesta = new ArrayList();
        Tienda tienda = new Tienda();

        String consulta = "SELECT * FROM tienda where id='" + id + "'";
        try {
            //----------------------------
            //Statement
            Statement statement
                    = this.conexion.createStatement();
            //Ejecucion
            ResultSet resultado
                    = statement.executeQuery(consulta);
            //----------------------------
            //Recorrido sobre el resultado

            while (resultado.next()) {

                tienda.setId(resultado.getString(1));
                tienda.setNombre(resultado.getString(2));
                tienda.setDireccion(resultado.getString(3));
                tienda.setTelefono(resultado.getString(4));
                tienda.setUrl(resultado.getString(5));
                respuesta.add(tienda);
            }

        } catch (SQLException ex) {
            ex.printStackTrace();
        }

        return tienda;
    }
    
    
    public ArrayList<String> idTiendasSugeridas(ArrayList<Producto> productos){
        
        ArrayList<String> ids = new ArrayList();

        for (int i = 0; i < productos.size(); i++) {
            if (i == 0) {
                String cadena = productos.get(i).getIdTienda().getId();
                ids.add(cadena);

            } else {
                String cadena = productos.get(i).getIdTienda().getId();

                for (int j = 0; j < ids.size(); j++) {
                    if (cadena.equals(ids.get(j))) {
                        j = ids.size();
                    } else if (j == ids.size() - 1) {
                        ids.add(cadena);
                    }
                }

            }
        }
        
        
        return ids;
    }

    public ArrayList<Tienda> sugerenciaTienda(ArrayList<Producto> productos) {
        ArrayList<Tienda> sugerencia = new ArrayList();
        ArrayList<String> ids = new ArrayList();
        
        ids=idTiendasSugeridas(productos);
        
        for (int i = 0; i < ids.size(); i++) {
            Tienda tienda = new Tienda();
            
            tienda=leerTiendaPorID(ids.get(i));
            sugerencia.add(tienda);
            
        }
        

        return sugerencia;
    }

}
