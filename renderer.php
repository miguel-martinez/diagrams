<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Structure diagrams question renderer class.
 *
 * @package    qtype
 * @subpackage diagrams
 * @copyright  2013 Jose Ignacion Hernando García, Miguel Martínez Pañeda
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();


/**
 * Generates the output for structure diagrams questions.
 *
 * @copyright  2013 Jose Ignacio Hernando García, Miguel Martínez Pañeda
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class qtype_diagrams_renderer extends qtype_renderer {
    public function formulation_and_controls(question_attempt $qa,
            question_display_options $options) {

        $question = $qa->get_question();
        $currentanswer = $qa->get_last_qt_var('answer');

        $inputname = $qa->get_qt_field_name('answer');
        $inputattributes = array(
            'type' => 'text',
            'name' => $inputname,
            'value' => $currentanswer,
            'id' => $inputname,
            'size' => 80,
        );

        if ($options->readonly) {
            $inputattributes['readonly'] = 'readonly';
        }

        $feedbackimg = '';
        if ($options->correctness) {
            $answer = $question->get_matching_answer(array('answer' => $currentanswer));
            if ($answer) {
                $fraction = $answer->fraction;
            } else {
                $fraction = 0;
            }
            $inputattributes['class'] = $this->feedback_class($fraction);
            $feedbackimg = $this->feedback_image($fraction);
        }

        $questiontext = $question->format_questiontext($qa);
        $placeholder = false;
        if (preg_match('/_____+/', $questiontext, $matches)) {
            $placeholder = $matches[0];
            $inputattributes['size'] = round(strlen($placeholder) * 1.1);
        }
        $input = html_writer::empty_tag('input', $inputattributes) . $feedbackimg;

        if ($placeholder) {
            $inputinplace = html_writer::tag('label', get_string('answer'),
                    array('for' => $inputattributes['id'], 'class' => 'accesshide'));
            $inputinplace .= $input;
            $questiontext = substr_replace($questiontext, $inputinplace,
                    strpos($questiontext, $placeholder), strlen($placeholder));
        }

        $result = html_writer::tag('div', $questiontext, array('class' => 'qtext'));

        if (!$placeholder) {
            $result .= html_writer::start_tag('div', array('class' => 'ablock'));
            $result .= html_writer::tag('label', get_string('answer', 'qtype_diagrams',
                    html_writer::tag('span', $input, array('class' => 'answer'))),
                    array('for' => $inputattributes['id']));
            $result .= html_writer::end_tag('div');
        }

        if ($qa->get_state() == question_state::$invalid) {
            $result .= html_writer::nonempty_tag('div',
                    $question->get_validation_error(array('answer' => $currentanswer)),
                    array('class' => 'validationerror'));
        }

	////////////////////////////////////////////////////////////////////////
	global $DB, $COURSE, $USER;
	$course_id=$COURSE->id;
	$editingteacher_role = 
	  $DB->get_record('role', array('shortname' => 'editingteacher'));
	$editingteacher_role_id=$editingteacher_role->id;
	// Esto seguro que se puede hacer de un modo mas sencillo:
	// Se comprueba si el usuario es editingteacher en este curso:
	$consulta="select mdl_role.shortname ".
	  "from mdl_role_assignments, mdl_user, mdl_role , ".
	  "     mdl_context, mdl_course ".
	  "where userid=mdl_user.id and roleid=mdl_role.id and ".
	  "      contextid=mdl_context.id and mdl_course.id=instanceid and ".
	  "      mdl_course.id=$COURSE->id and ".
	  "      mdl_user.id=$USER->id and mdl_role.id=$editingteacher_role_id";
	
	$is_role_teacher = $DB->get_records_sql($consulta);

	// Se determina la variable debug
	$debug=0;
	foreach ($is_role_teacher as $k) {
	  if($k->shortname == "editingteacher") {
	    $debug=1;  //1:    Dibuja la solucion
	               //0: No dibuja la solucion
	  }
	}
	if($USER->username== "admin") { $debug=1;};	
	
	// Se determina si se dibujan los botones
	$flag_botones=1;
	if ($options->readonly) {
            $flag_botones=0;
        }
	$result .=$this->diagramsJs($qa, $debug , "formulation_and_controls", $flag_botones,1 );
        return $result;
    }

    public function diagramsJs ($qa, $debug, $estado, $flag_botones,$mi_feedback) 
    {   
      $question = $qa->get_question();
      global $DB;
      ///////////////////////////////////////////////////////////////////////	
      // Ancho del canvas en tanto por ciento
      $width=$DB->get_field('question_diagrams', 'width', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
      

      $result  .= html_writer::tag('div',"", 
			 array('class' => 'qtext'
			       )); 
      $result  .= 
	html_writer::tag('div',"", 
			 array('class' => 'qtext',
			       'id'=>'container_graphofinternalforces_'.$estado."_".$qa->get_qt_field_name('id'),
			       'style'=>'position: relative; width:'.$width.'%'
			       )
			 ); 
      
      ////////////////////////////////////////////////////////////////////////
      // Variables que se deben pasar a diagrams.js 
      // (con los mismos nombres que se utilizan en el fichero javascript:
      // arg1, barText, solText, flagviga, mdl_nq, depur, qt_field_name
      // Pendiente: ¿Cambiamos los nombres de estas variables en javascript y aqui?
      
      $arg1="graphofinternalforces_$estado"."_".$qa->get_qt_field_name('id');
      
      $barText=$DB->get_field('question_diagrams', 'topology', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
      
      $solText=$DB->get_field('question_diagrams', 'graphofinternalforces', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
      
      $flagviga=$DB->get_field('question_diagrams', 'beam', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
      
      $mdl_nq=$question->id; 

      $mi_feedback=$DB->get_field('question_diagrams', 'mifeedback', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
      
      $internalforceserror=$DB->get_field('question_diagrams', 'internalforceserror', array ('question'=>$question->id), $strictness=IGNORE_MISSING);

      $abscissaerror=$DB->get_field('question_diagrams', 'abscissaerror', array ('question'=>$question->id), $strictness=IGNORE_MISSING);
         
      //Parametro codificado que se pasa a javascript
      $javascript_parametro=$arg1."&".$barText."&".$solText."&".$flagviga."&".$mdl_nq."&".$debug."&".$qa->get_qt_field_name('id')."&".$flag_botones."&".$mi_feedback."&".$internalforceserror."&".$abscissaerror;
      
     global $CFG;
     $result .=html_writer::tag('div', "</script><script type=\"text/javascript\" src=\"".$CFG->wwwroot."/question/type/diagrams/diagrams.js?".base64_encode($javascript_parametro)."\"></script>", array('class' => 'qtext'));
     return $result;
    }

    public function specific_feedback(question_attempt $qa) {
        $question = $qa->get_question();

        $answer = $question->get_matching_answer(array('answer' => $qa->get_last_qt_var('answer')));
        if (!$answer || !$answer->feedback) {
            return '';
        }

        return $question->format_text($answer->feedback, $answer->feedbackformat,
                $qa, 'question', 'answerfeedback', $answer->id);
    }

    public function correct_response(question_attempt $qa) {
      $myoutput =get_string('correctansweris', 'qtype_diagrams',"");
      $myoutput .=$this->diagramsJs($qa, 1 , "correct_response", 0, 1 );
      return $myoutput;
     
    }

}
