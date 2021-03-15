echo "============= INSTALLING MYSQL =============="
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password p455w0rd'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password p455w0rd'
sudo apt -y install mysql-server mysql-client

FILENAME="/etc/mysql/mysql.conf.d/mysqld.cnf"
SEARCH="127.0.0.1"
REPLACE="0.0.0.0"
sudo sed -i "s/$SEARCH/$REPLACE/gi" $FILENAME

# disable secure file privileges (so we can import a csv file)
echo 'secure_file_priv=""' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf

mysql -u root -pp455w0rd website -e "DROP DATABASE IF EXISTS website; DROP USER IF EXISTS websiteuser;"
mysql -u root -pp455w0rd -e "create database website";
mysql -u root -pp455w0rd website < setup.sql