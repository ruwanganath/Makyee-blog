<?php

/**
 * This is the model class for table "{{post}}".
 *
 * The followings are the available columns in table '{{post}}':
 * @property integer $id
 * @property integer $user_id
 * @property string $title
 * @property string $description
 * @property string $content
 * @property integer $public
 * @property string $created_at
 *
 * The followings are the available model relations:
 * @property Like[] $likes
 * @property User $user
 */
class Post extends CActiveRecord
{
    /**
     * @return string the associated database table name
     */
    public function tableName()
    {
        return '{{post}}';
    }

    /**
     * @return array validation rules for model attributes.
     */
    public function rules()
    {
        // NOTE: you should only define rules for those attributes that
        // will receive user inputs.
        return array(
            array('user_id, title, description, content, created_at', 'required'),
            array('user_id, public', 'numerical', 'integerOnly'=>true),
            array('title', 'length', 'max'=>255),
            // The following rule is used by search().
            // @todo Please remove those attributes that should not be searched.
            array('id, user_id, title, description, content, public, created_at', 'safe', 'on'=>'search'),
        );
    }

    /**
     * @return array relational rules.
     */
    public function relations()
    {
        // NOTE: you may need to adjust the relation name and the related
        // class name for the relations automatically generated below.
        return array(
            'likes' => array(self::HAS_MANY, 'Like', 'post_id'),
            'user' => array(self::BELONGS_TO, 'User', 'user_id'),
        );
    }

    /**
     * @return array customized attribute labels (name=>label)
     */
    public function attributeLabels()
    {
        return array(
            'id' => 'ID',
            'user_id' => 'User',
            'title' => 'Title',
            'description' => 'Description',
            'content' => 'Content',
            'public' => 'Public',
            'created_at' => 'Created At',
        );
    }

    /**
     * Retrieves a list of models based on the current search/filter conditions.
     *
     * Typical usecase:
     * - Initialize the model fields with values from filter form.
     * - Execute this method to get CActiveDataProvider instance which will filter
     * models according to data in model fields.
     * - Pass data provider to CGridView, CListView or any similar widget.
     *
     * @return CActiveDataProvider the data provider that can return the models
     * based on the search/filter conditions.
     */
    public function search()
    {
        // @todo Please modify the following code to remove attributes that should not be searched.

        $criteria = new CDbCriteria;

        $criteria->compare('id', $this->id);
        $criteria->compare('user_id', $this->user_id);
        $criteria->compare('title', $this->title, true);
        $criteria->compare('description', $this->description, true);
        $criteria->compare('content', $this->content, true);
        $criteria->compare('public', $this->public);
        $criteria->compare('created_at', $this->created_at, true);

        return new CActiveDataProvider($this, array(
            'criteria' => $criteria,
        ));
    }

    /**
     * Returns the static model of the specified AR class.
     * Please note that you should have this exact method in all your CActiveRecord descendants!
     * @param string $className active record class name.
     * @return Post the static model class
     */
    public static function model($className = __CLASS__)
    {
        return parent::model($className);
    }

    
    /**
     * Gets public posts with optional filters.
     * @param integer|null $public
     * @param string|null $search
     * @param integer|null $author
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array the list of posts
     */
    public static function getPublicPosts($public = null, $search = null, $author = null, $startDate = null, $endDate = null)
    {
        $db = Yii::app()->db;

        $sql = "SELECT * FROM {{post}} p WHERE p.public = :public";

        if ($search !== null) {
            $sql .= " AND (p.title = :search OR p.description = :search)";
        }

        if ($author !== null) {
            $sql .= " AND p.user_id = :author";
        }

        if ($startDate !== null && $endDate !== null) {
            $sql .= " AND p.created_at BETWEEN :startDate AND :endDate";
        } elseif ($startDate !== null) {
            $sql .= " AND p.created_at >= :startDate";
        } elseif ($endDate !== null) {
            $sql .= " AND p.created_at <= :endDate";
        }

        $command = $db->createCommand($sql);

        $command->bindParam(':public', $public, PDO::PARAM_INT);

        if ($search !== null) {
            $command->bindParam(':search', $search, PDO::PARAM_STR);
        }

        if ($author !== null) {
            $command->bindParam(':author', $author, PDO::PARAM_INT);
        }

        if ($startDate !== null) {
            $command->bindParam(':startDate', $startDate, PDO::PARAM_STR);
        }

        if ($endDate !== null) {
            $command->bindParam(':endDate', $endDate, PDO::PARAM_STR);
        }

        $posts = $command->queryAll();

        return $posts;
    }

    
    public static function getPublicPostsWithComments()
    {
        // Get the database connection
        $db = Yii::app()->db;

        // Define the SQL query
        $sql = "
            SELECT p.id, p.title, p.description, p.content, p.created_at, p.user_id, COUNT(c.id) as comment_count
            FROM tbl_post p
            JOIN tbl_comment c ON p.id = c.post_id
            WHERE p.public = '1'
            GROUP BY p.id
            HAVING COUNT(c.id) >= 1 AND p.user_id IN (
                SELECT user_id
                FROM tbl_post
                GROUP BY user_id
                HAVING COUNT(id) >= 2
            );
        ";

        // Execute the query and fetch results
        $command = $db->createCommand($sql);
        $posts = $command->queryAll();

        return $posts;
    }
}
