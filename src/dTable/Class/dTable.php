<?php
namespace dTable\Class;
 
/**
 * Класс для создания HTML разметки таблицы dTable
 * 
 * Позволяет "рисовать" таблицу dTable с помощью вызова
 * только одного метода этого класса:
 * dTable()
 * 
 * Вызывается из View с параметрами, полученными в Model
 * Параметры формируются в методе, в котором происходит сам запрос.
 * 
 * Здесь описана "стандартная" таблица. 
 * Если нужна другая структура, можно сделать другой класс или
 * использовать методы этого класса как основу
 * 
 * Версия: 1
 * Дата: 2023-11-13
 */
class dTable {

    public $modulUrl; // Имя модуля для которого строим таблицу. Используется для формирования правильных ссылок
    public $data; // Данные
    public $buttons; // Кнопки
    //
    // Различные параметры
    private $isExportXlsShowButton = false; // Показывать ли кнопку "Экспорт в xlsx"
    private $withCheckboxes = false; // Показывать ли колонку с чекбоксами
    private $showRowNumbers = false; // Показывать ли колонку с номерами строк
    private $trAttributes = array(); // Массив атрибутов для tr
    private $tdAHref = ''; // Ссылка для каждой ячейки, кроме кнопок
    private $tableClassList = ''; // Список классов для тэга <table> разделённый пробелами
    private $additionalColumns = array(); // Массив дополнительных колонок для строки таблицы
    private $actionsUrl = ''; // Ссылка для страницы с массовыми операциями
    private $actions = []; // Массив для массовых операций
    private $styles = []; // Массив стилей для отрисовки элементов таблицы
  
    /**
     * @param array $data Массив
     * $data['row_count'] integer Количество строк всего
     * $data['page_row_count'] integer Количество строк на странице
     * $data['current_page'] integer Текущая страница
     * $data['fieldsForView']['name'] string Имя поля
     * $data['fieldsForView']['show'] string Показывать или нет поле. '1' - Показывать
     * $data['fieldsForView']['title'] string Тайтл
     * $data['fieldsForView']['type'] string Тип. Варианты: fSelect, fText, fDateInterval. Если пусто - клизма не отображается - фильтр делать нельзя
     * $data['fieldsForView']['filterValue'] string Строка со значениями фильтра через запятую, или 'null'.
     * Пример
     * Для fSelect: 'null' или '2,4,5,6'                  | Строка со значениями фильтра через запятую, или 'null'
     * Для fText: null или 'Программирование'             | Строка со значением фильтра, или null
     * Для fDateInterval: '' или '02.11.2023,04.11.2023'  | Строка со значениями фильтра через запятую, или ''
     * $data['fieldsForView']['filterTitle'] string 
     * Пример
     * Для fSelect: '' или '2 выбрано'                      | Где 2 - количество выбранных значений в select
     * Для fText: null или 'Программирование'               | Строка со значением фильтра, или null
     * Для fDateInterval: '' или '02.11.2023 - 04.11.2023'  | Строка со значениями фильтра через запятую, или ''
     * $data['fieldsForView']['filterTitleFull'] string 
     * Пример
     * Для fSelect: array() или array(0=>array('ID'=>1, 'NAME'=>'Очное'))   | Массив-справочник вида ID=>NAME
     * Для fText: '' или 'Программирование'                                 | Строка со значением фильтра, или ''
     * Для fDateInterval: '' или array('02.11.2023','04.11.2023')           | Массив со значениями, или пустая строка
     * $data['fieldsForView']['ordType'] string Тип сортировки: 'asc', 'desc'. По умолчанию 'asc'
     * 
     * @param array $params Параметры - массив значений различных параметров
     * Возможные параметры:
     * isExportXlsShowButton bool Показывать ли кнопку "Экспорт в xlsx"
     * withCheckboxes bool Показывать ли колонку с чекбоксами
     * trAttributes array Массив массивов атрибутов для tr
     * Пример: array(array('attrName' => 'data-id', 'fieldName'=>'ID')) 
     * где attrName - атрибут который будет создан у tr
     * где fieldName - название поля из запроса которое будет значением атрибута. Это поле должно быть в запросе в SELECT
     * tdAHref string Ссылка для каждой ячейки, кроме кнопок
     * additionalColumns array Массив строк. Отображается в конце таблицы в виде дополнительных колонок
     * Пример: 
     * array(
     *  '<button class="some-action">Нажми меня</button>',
     *  '<a class="ms-1" href="/ModerAchievementBak/CheckAchievement?applicationId={ID}"><i class="fa fa-pencil pe-2">Проверить ИД</i></a>'
     * )
     * В результате добавятся 2 ячейки с переданным содержимым для одной строки
     */
    function __construct($modulUrl, $data, $buttons, $params = array()) {
      $this->modulUrl = $modulUrl;
      $this->data = $data;
      $this->buttons = $buttons;
      //
      // Установка различных параметров. Смотрим что пришло в $params в конструктор
      $this->isExportXlsShowButton = isset($params['isExportXlsShowButton']) && $params['isExportXlsShowButton'] === true;
      $this->withCheckboxes = isset($params['withCheckboxes']) && $params['withCheckboxes'] === true;
      $this->showRowNumbers = isset($params['showRowNumbers']) && $params['showRowNumbers'] === true;
      $this->trAttributes = isset($params['trAttributes']) ? (array)$params['trAttributes'] : array();
      $this->tdAHref = isset($params['tdAHref']) ? (string)$params['tdAHref'] : '';
      $this->tableClassList = isset($params['tableClassList']) ? (string)$params['tableClassList'] : '';
      $this->additionalColumns = isset($params['additionalColumns']) ? (array)$params['additionalColumns'] : array();
      $this->actionsUrl = isset($params['actionsUrl']) ? (string)$params['actionsUrl'] : '';
      $this->actions = isset($params['actions']) ? (array)$params['actions'] : [];
      $this->styles = isset($params['styles']) ? (array)$params['styles'] : [];
    }
  
    /**
     * Вывод всей таблицы
     * Блоки которые будут выведены:
     * 1. Блок фильтров
     * 2. Сама таблица
     * 3. Навигация
     * 
     * Можно пользоваться блоками по отдельности, вызывая конкретные методы
     */
    function dTable() {
      $this->dTableFilterView($this->data);
      $this->dTableTable($this->data, $this->buttons);
      $this->pageNavigation($this->data);
    }
  
    /**
     * Вывод блока фильтров
     */
    function dTableFilterView($data) {
      echo '<div class="filterView">';
  
      foreach ($data['fieldsForView'] as $fieldForView) {
        if (
          isset($fieldForView['filterTitleFull']) && !empty($fieldForView['filterTitleFull']) 
          || !empty($fieldForView['filterValue']) && $fieldForView['filterValue'] !== 'null') {
            // В случае установки фильтров в fSelect с помощью GET-параметров
            // возможны случаи, когда установленный filterValue будет отсутствовать 
            // среди возможных значений. В этом случае нам надо всё равно показать,
            // что фильтр задан, хотя он и будет пустой
          echo '<div class="filterItem lh-lg" data-name="' . $fieldForView['name'] . '" data-type="' . $fieldForView['type'] . '">';
          echo $fieldForView['title'] .'<a href="#" class="ps-1 text-muted inline-block removeFilterItem" title="Очистить фильтр"><i class="fa fa-times"></i></a>'. ': ';
          if ($fieldForView['type'] === 'fSelect') {
            foreach ($fieldForView['filterTitleFull'] as $filterTitleFull) {
              echo '<a class="p-1 removeFilterItemElement" href="#" data-id="' . $filterTitleFull['ID'] . '">';
              echo '<span class="badge rounded-pill text-bg-success">' . $filterTitleFull['NAME'] . ' <i class="'.$this->styles['iClassX'].'"></i></span>';
              echo '</a>';
            }
          }
          if ($fieldForView['type'] === 'fText') {
            echo '<a href="#" class="removeFilterItemElement">';
            echo '<span class="badge rounded-pill text-bg-success">' . $fieldForView['filterTitleFull'] . ' <i class="'.$this->styles['iClassX'].'"></i></span>';
            echo '</a>';
          }
          if ($fieldForView['type'] === 'fDateInterval') {
            echo '<a href="#" class="removeFilterItemElement">';
            echo '<span class="badge rounded-pill text-bg-success">';
            if (isset($fieldForView['filterTitleFull'][0])) {
              echo $fieldForView['filterTitleFull'][0];
              echo ' - ';
            }
            if (isset($fieldForView['filterTitleFull'][1])) {
              echo $fieldForView['filterTitleFull'][1];
            }
            echo ' <i class="'.$this->styles['iClassX'].'"></i>';
            echo '</span>';
            echo '</a>';
          }
          echo '</div>';
        }
      }
      echo '</div>';
    }
  
    /**
     * Вывод самой таблицы с кнопкой Настроить
     */
    function dTableTable($data, $buttons) {
      $countButtons = count($buttons);
  ?>
  
      <div class="d-flex align-items-center py-1 dTableActions">
  
        <div class="selected-rows input-group input-group-sm my-1" style="width:auto;display:none">
          <!-- <button class="btn btn-outline-secondary" type="button"><i class="<?php //echo $this->styles['iClassX']; ?>"></i></button> -->
          <label class="input-group-text" for="">
          <a class="" href="#" title="Сбросить"><i class="<?php echo $this->styles['iClassX']; ?> pe-1 btn-reset"></i></a>
            Отмечено строк: <span class="selected-rows-count ps-1"></span>
          </label>
          <label class="input-group-text" for="">Действия для отмеченных</label>
  
          <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul class="dropdown-menu">
            <?php
            foreach($this->actions as $action){
              echo '<li><a class="dropdown-item" href="'.$this->actionsUrl.'&action='.$action['action'].'">'.$action['name'].'</a></li>';
            }
            ?>
          </ul>
  
        </div>
  
        <a class="SelectColumns ms-auto" href="#">
          Настроить <i class="<?php echo $this->styles['iClassSettings']; ?>"></i>
        </a>
      </div>
      <div class="table-responsive">
        <table class="table table-dtable <?php echo $this->tableClassList; ?>">
          <thead class="align-middle">
            <tr>
              <?php if ($this->withCheckboxes) : ?>
                <th class="td-icons-1"><input type="checkbox" class="check_row" value="all"></th>
              <?php endif; ?>
              <?php if (!empty($countButtons)) : ?>
                <th class="td-icons-<?php echo $countButtons; ?>"></th>
              <?php endif; ?>
              <?php if ($this->showRowNumbers) : ?>
                <th class="text-muted">#</th>
              <?php endif; ?>
              <!-- <th>ID</th> -->
              <?php
              foreach ($data['fieldsForView'] as $fieldForView) {
                if ($fieldForView['show'] !== '1') {
                  continue;
                }
                echo '<th class="text-center">';
                $ord = !empty($fieldForView['ordType']) ? ' data-ord="yes" data-ord-type="' . $fieldForView['ordType'] . '"' : '';
                $ord_icon = !empty($fieldForView['ordType']) ? $fieldForView['ordType'] === 'desc' ? '<i class="fa fa-long-arrow-down ps-1"></i>' : '<i class="fa fa-long-arrow-up ps-1"></i>' : '';
                echo '<a href="#" class="table-head-title text-decoration-none" data-name="' . $fieldForView['name'] . '" ' . $ord . '>' . $fieldForView['title'] . $ord_icon . '</a>';
                echo '</th>';
              }
              if (!empty($this->additionalColumns)) {
                foreach ($this->additionalColumns as $addColumn) {
                  echo '<td>';
                  echo '</td>';
                }
              }
              ?>
            </tr>
            <tr>
              <?php if ($this->withCheckboxes) : ?>
                <th class="td-icons-1"></th>
              <?php endif; ?>
              <?php if (!empty($countButtons)) : ?>
                <th class="td-icons-<?php echo $countButtons; ?>"></th>
              <?php endif; ?>
              <?php if ($this->showRowNumbers) : ?>
                <th></th>
              <?php endif; ?>
              <!-- <th></th> -->
              <?php
              foreach ($data['fieldsForView'] as $fieldForView) {
                if ($fieldForView['show'] !== '1') {
                  continue;
                }
                echo '<th class="text-center fs-4">';
                if (!empty($fieldForView['type'])) {
                  echo '<a href="#" class="a-filter" data-title="' . $fieldForView['title'] . '" '
                    . 'data-name="' . $fieldForView['name'] . '" '
                    . 'data-type="' . $fieldForView['type'] . '" '
                    . 'data-filter-value="' . $fieldForView['filterValue'] . '" '
                    . 'data-filter-title="' . $fieldForView['filterTitle'] . '">';
                  if (empty($fieldForView['filterTitle'])) {
                    echo '<i class="'.$this->styles['iClassFilter'].'"></i>';
                  } else {
                    echo '<i class="'.$this->styles['iClassFilter'].' text-success"></i>';
                  }
                  echo '</a>';
                } else {
                  echo '&nbsp;';  // Чтобы строка не слопнулась если нет ни одного фильтра
                }
                echo '</th>';
              }

              if (!empty($this->additionalColumns)) {
                foreach ($this->additionalColumns as $addColumn) {
                  echo '<td>';
                  echo '</td>';
                }
              }
              ?>
  
            </tr>
          </thead>
          <tbody>
            <?php
            foreach ($data['table'] as $row) {
  
              $rowId = $row['ID'];
  
  
              // Добавление атрибутов
              $attrString = '';
              if (!empty($this->trAttributes)) {
                $attrArray = array();
                foreach ($this->trAttributes as $attr) {
                  $attrArray[] = $attr['attrName'] . '=' . '"' . $row[$attr['fieldName']] . '"';
                }
                $attrString = implode(' ', $attrArray);
              }
              // --Добавление атрибутов
  
              // echo '<tr data-id="' . $rowId . '" data-name="' . $row['NAME'] . '">';
              echo '<tr ' . $attrString . '>';
  
              if ($this->withCheckboxes) {
                echo '<td>' . '<input type="checkbox" class="check_row">' . '</td>';
              }
              //
              // Кнопки
              if (!empty($countButtons)) {
                echo '<td>';
                foreach ($buttons as $button) {
                  $href = isset($button['href']) ? $this->urlParamsReplace($button['href'], $row) : '#';
                  echo ' <a class="' . ($button['class'] ?? '') . ' " href="' . htmlspecialchars($href) . '" title="' . ($button['title'] ?? '') . '"><i class="' . ($button['icon_class'] ?? '') . '"></i></a>';
                }
                echo '</td>';
              }
              // --Кнопки
              //
              if ($this->showRowNumbers) {
                echo '<td class="text-muted">' . $row['RowNumber'] . '</td>';
              }
              // echo '<td>' . $rowId . '</td>';
  
              foreach ($data['fieldsForView'] as $fieldForView) {
                if ($fieldForView['show'] !== '1') continue;
                echo '<td>';
                if (!empty($this->tdAHref)) {
                  $href = $this->urlParamsReplace($this->tdAHref, $row);
                  echo '<a href="' .htmlspecialchars($href) . '">' . $row[$fieldForView['name']] . '</a>';
                } else {
                  echo $row[$fieldForView['name']];
                }
                echo '</td>';
              }

              if (!empty($this->additionalColumns)) {
                foreach ($this->additionalColumns as $addColumn) {
                  echo '<td>';
                  echo $this->urlParamsReplace($addColumn, $row);
                  echo '</td>';
                }
              }
              echo '</tr>';
            }
            ?>
          </tbody>
        </table>
      </div>
    <?php
    }
  
    /**
     * Вывод блока навигации по страницам
     * 
     * @param array $data
     * $data["page_row_count"] - Количество строк на странице
     * $data["row_count"] - Количество строк всего
     * $data["page"] - Текущая страница
     * 
     */
    function pageNavigation($data) {
  
      $page_row_count = $data["page_row_count"];
  
    ?>
      <nav class="d-flex flex-wrap dTableNav" style="align-items: center;" aria-label="Page navigation example">
        <ul class="pagination pagination-sm m-0 me-4 my-2">
          <li class="page-item <?php if ($data["page"] == 1) echo "disabled"; ?>">
            <a class="page-link" data-page="1" title="1" href="#" aria-label="First">
              <i class="<?php echo $this->styles['iClassFirst']; ?>"></i>
            </a>
          </li>
          <li class="page-item <?php if ($data["page"] == 1) echo "disabled"; ?>">
            <a class="page-link" data-page="<?php echo ($data["page"] - 1); ?>" title="<?php echo ($data["page"] - 1); ?>" href="#" aria-label="Previous">
              <i class="<?php echo $this->styles['iClassPrev']; ?>"></i>
            </a>
          </li>
          <?php
          $last_page = 1;
          $pages = $this->pages($data["row_count"], $page_row_count, $data["page"]);
          foreach ($pages["array"] as $k) :
          ?>
            <li class="page-item <?php if ($k == (isset($data["page"]) ? $data["page"] : 1)) echo "active"; ?>">
              <a class="page-link" data-page="<?php echo $k; ?>" href="#"><?php echo $k; ?></a>
              <?php $last_page = $k; ?>
            </li>
          <?php endforeach; ?>
          <li class="page-item <?php if ($data["page"] == $last_page) echo "disabled"; ?>">
            <a class="page-link" data-page="<?php echo ($data["page"] + 1); ?>" title="<?php echo ($data["page"] + 1); ?>" href="#" aria-label="Next">
              <i class="<?php echo $this->styles['iClassNext']; ?>"></i>
            </a>
          </li>
          <li class="page-item <?php if ($data["page"] == $last_page) echo "disabled"; ?>">
            <a class="page-link" data-page="<?php echo $pages["count"]; ?>" title="<?php echo $pages["count"]; ?>" href="#" aria-label="Last">
              <i class="<?php echo $this->styles['iClassLast']; ?>"></i>
            </a>
          </li>
        </ul>
        <select name="row_count" class="form-select select_row_count me-4 my-2" style="width: 200px;">
          <?php foreach (array(10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000) as $i) : ?>
            <option <?php if ($i == $page_row_count) echo "selected"; ?> value="<?php echo $i; ?>">По <?php echo $i; ?> на странице</option>
          <?php endforeach; ?>
        </select>
        <!-- <div class="ms-3">На странице</div> -->
        <div class="">Всего строк: <?php echo $data['row_count']; ?></div>
        <div class="" style="margin-left:auto">
          <?php if ($this->isExportXlsShowButton) : ?>
            <button class="btn btn-success btn-to-xls"><i class="<?php echo $this->styles['iClassExternalLink']; ?>"></i>Экспорт в xlsx</button>
          <?php endif; ?>
        </div>
      </nav>
  <?php
    }
  
    /**
     * Генерация страниц для блока навигации по страницам
     * @param integer $row_count Количество строк всего
     * @param integer $page_row_count Количество строк на странице
     * @param integer $current_page Текущая страница
     * @return array
     */
    function pages($row_count, $page_row_count, $current_page) {
      $result = array();
      $pages = iterator_to_array($this->page_num_generator($row_count, $page_row_count));
      $pages_count = count($pages);
      if ($pages_count > 5) {
        switch ($current_page) {
          case 1:
          case 2:
          case 3:
            $result = array_slice($pages, 0, 5);
            break;
          case $pages_count:
          case $pages_count - 1:
          case $pages_count - 2:
            $result = array_slice($pages, -5, 5);
            break;
          default:
            $result = array_slice($pages, $current_page - 3, 5);
            break;
        }
      } else {
        $result = $pages;
      }
  
      return array("array" => $result, "count" => $pages_count);
    }
  
    /**
     * Подставляет в шаблон строки переменные из массива
     * Например из: http://site/module/action?id={$ID}
     * делает: http://site/module/action?id=123
     */
    private function urlParamsReplace($url, $row) {
      preg_match_all("/{\\$[^}]*}/", $url, $matches);
      if (isset($matches[0])) {
        foreach ((array)$matches[0] as $fVal) {
          $val = trim($fVal, '{$}');
          if (isset($row[$val])) {
            $url = str_replace($fVal, $row[$val], $url);
          }
        }
      }
      return $url;
    }

    /**
     * Подсчёт количества страниц для блока навигации по страницам
     * @param integer $row_count Количество строк всего
     * @param integer $page_row_count Количество строк на странице
     */
    static function page_num_generator($row_count, $page_row_count) {
        for ($k = 1; $k <= floor($row_count/$page_row_count) + ($row_count % $page_row_count > 0 ? 1 : 0); $k++) {
        yield($k);
        }
    }
  }
  